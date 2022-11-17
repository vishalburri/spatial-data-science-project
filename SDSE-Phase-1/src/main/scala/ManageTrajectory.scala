
import org.apache.log4j.{Level, Logger}
import org.apache.spark.sql.{DataFrame, Row, SaveMode, SparkSession}

import scala.collection.mutable.ListBuffer
import scala.util.control.Breaks.{break, breakable}
import scala.math._

object ManageTrajectory {

  Logger.getLogger("org.spark_project").setLevel(Level.WARN)
  Logger.getLogger("org.apache").setLevel(Level.WARN)
  Logger.getLogger("akka").setLevel(Level.WARN)
  Logger.getLogger("com").setLevel(Level.WARN)


  def loadTrajectoryData(spark: SparkSession, filePath: String, outputfilepath: String): Unit = {
    import spark.implicits._
    val df = spark.read.option("multiline", "true").json(filePath)
    val dfArray = df.collect()
    val dfSize = dfArray.length
    val data: ListBuffer[(ListBuffer[(List[Double], Long)], Long, Long, Double, Double, Double, Double)] = new ListBuffer()
    for (rowIndex <- 0 until dfSize) {
      val rowList = dfArray(rowIndex).getSeq[Row](0)
      val trajectory_id = dfArray(rowIndex).getLong(1)
      val vehicle_id = dfArray(rowIndex).getLong(2)
      val trajList = new ListBuffer[(List[Double], Long)]()
      var maxLatitude = Double.MinValue
      var maxLongitude = Double.MinValue
      var minLatitude = Double.MaxValue
      var minLongitude = Double.MaxValue
      rowList.foreach(f => {
        val lat: Double = f.getList(0).get(0)
        val lon: Double = f.getList(0).get(1)
        val timeStamp: Long = f.getLong(1)

        maxLatitude = max(lat, maxLatitude)
        minLatitude = min(lat, minLatitude)
        maxLongitude = max(lon, maxLongitude)
        minLongitude = min(lon, minLongitude)

        trajList += Tuple2(List(lat, lon), timeStamp)
      })
      val sortedRow = trajList.sortBy(_._2)
      data += Tuple7(sortedRow, trajectory_id, vehicle_id, minLatitude, minLongitude, maxLatitude, maxLongitude)
    }
    var resultDF =
      data
        .toDF("trajectory", "trajectory_id", "vehicle_id", "min_latitude", "min_longitude", "max_latitude", "max_longitude")
    resultDF.coalesce(1).write.mode(SaveMode.Overwrite).json(outputfilepath)
  }


  def getSpatialRange(spark: SparkSession, latMin: Double, lonMin: Double, latMax: Double, lonMax: Double, outputfilepath: String, inputfilepath: String): Unit = {
    import spark.implicits._
    val dfTrajectory = spark.read.option("multiline", "true").json(inputfilepath)
    val dfArray = dfTrajectory.collect()
    val dfSize = dfArray.length
    val data: ListBuffer[(Long, Long, List[Long], ListBuffer[List[Double]])] = new ListBuffer()
    for (rowIndex <- 0 until dfSize) {
      val rowList = dfArray(rowIndex).getSeq[Row](4)

      val minLatitude = dfArray(rowIndex).getDouble(2)
      val minLongitude = dfArray(rowIndex).getDouble(3)
      val maxLatitude = dfArray(rowIndex).getDouble(0)
      val maxLongitude = dfArray(rowIndex).getDouble(1)

      if ((min(lonMax, maxLongitude) >= max(lonMin, minLongitude)) && (min(latMax, maxLatitude) >= max(latMin, minLatitude))) {
        val trajectory_id = dfArray(rowIndex).getLong(5)
        val vehicle_id = dfArray(rowIndex).getLong(6)
        val timeStampList = new ListBuffer[Long]()
        val locationList: ListBuffer[List[Double]] = new ListBuffer()
        var trajectoryExists = false
        rowList.foreach(f => {
          val lat: Double = f.getList(0).get(0)
          val lon: Double = f.getList(0).get(1)
          val timeStamp: Long = f.getLong(1)
          if (lat >= latMin && lat <= latMax && lon >= lonMin && lon <= lonMax) {
            timeStampList += timeStamp
            locationList += List(lat, lon)
            trajectoryExists = true
          }
        })
        if (trajectoryExists) {
          data += Tuple4(trajectory_id, vehicle_id, timeStampList.toList, locationList)
        }
      }
    }

    val sortedData = data.sortBy(_._1)(Ordering[Long].reverse)

    val resultDF =
      sortedData
        .toDF("trajectory_id", "vehicle_id", "timestamp", "location")
    resultDF.coalesce(1).write.mode(SaveMode.Overwrite).json(outputfilepath)
  }


  def getSpatioTemporalRange(spark: SparkSession, timeMin: Long, timeMax: Long, latMin: Double, lonMin: Double, latMax: Double, lonMax: Double, outputfilepath: String, inputfilepath: String): Unit = {
    import spark.implicits._
    val dfTrajectory = spark.read.option("multiline", "true").json(inputfilepath)
    val dfArray = dfTrajectory.collect()
    val dfSize = dfArray.length
    val data: ListBuffer[(Long, Long, List[Long], ListBuffer[List[Double]])] = new ListBuffer()
    for (rowIndex <- 0 until dfSize) {
      val rowList = dfArray(rowIndex).getSeq[Row](4)

      val minLatitude = dfArray(rowIndex).getDouble(2)
      val minLongitude = dfArray(rowIndex).getDouble(3)
      val maxLatitude = dfArray(rowIndex).getDouble(0)
      val maxLongitude = dfArray(rowIndex).getDouble(1)

      if (min(lonMax, maxLongitude) >= max(lonMin, minLongitude)
        && min(latMax, maxLatitude) >= max(latMin, minLatitude)
        && min(timeMax, rowList.last.getLong(1)) >= max(timeMin, rowList.head.getLong(1))) {

        val trajectory_id = dfArray(rowIndex).getLong(5)
        val vehicle_id = dfArray(rowIndex).getLong(6)
        val timeStampList = new ListBuffer[Long]()
        val locationList: ListBuffer[List[Double]] = new ListBuffer()
        var trajectoryExists = false
        rowList.foreach(f => {
          val lat: Double = f.getList(0).get(0)
          val lon: Double = f.getList(0).get(1)
          val timeStamp: Long = f.getLong(1)
          if (lat >= latMin && lat <= latMax && lon >= lonMin && lon <= lonMax && timeStamp >= timeMin && timeStamp <= timeMax) {
            timeStampList += timeStamp
            locationList += List(lat, lon)
            trajectoryExists = true
          }
        })
        if (trajectoryExists) {
          data += Tuple4(trajectory_id, vehicle_id, timeStampList.toList, locationList)
        }
      }
    }

    val resultDF =
      data
        .toDF("trajectory_id", "vehicle_id", "timestamp", "location")

    resultDF.coalesce(1).write.mode(SaveMode.Overwrite).json(outputfilepath)
  }


  def getKNNTrajectory(spark: SparkSession, trajectoryId: Long, neighbors: Int, outputfilepath: String, inputfilepath: String): Unit = {
    import spark.implicits._
    val data: ListBuffer[Long] = new ListBuffer()
    val dfTrajectory = spark.read.option("multiline", "true").json(inputfilepath)
    val dfArray = dfTrajectory.collect()
    val dfSize = dfArray.length
    var trajectoryList: Seq[Row] = Seq()
    breakable {
      for (rowIndex <- 0 until dfSize) {
        val rowList = dfArray(rowIndex).getSeq[Row](4)
        val trajectory_id = dfArray(rowIndex).getLong(5)
        if (trajectory_id == trajectoryId) {
          trajectoryList = rowList
          break
        }
      }
    }
    var distList: ListBuffer[(Double, Long)] = ListBuffer()
    for (rowIndex <- 0 until dfSize) {
      val rowList = dfArray(rowIndex).getSeq[Row](4)
      val trajectory_id = dfArray(rowIndex).getLong(5)

      if (trajectory_id != trajectoryId) {
        var min_distance = Double.MaxValue
        for (ind1 <- rowList.indices) {
          for (ind2 <- trajectoryList.indices) {
            val lat1: Double = rowList(ind1).getList(0).get(0)
            val lon1: Double = rowList(ind1).getList(0).get(1)
            val lat2: Double = trajectoryList(ind2).getList(0).get(0)
            val lon2: Double = trajectoryList(ind2).getList(0).get(1)
            val dist: Double = sqrt((lat2 - lat1) * (lat2 - lat1) + (lon2 - lon1) * (lon2 - lon1))
            if (dist < min_distance) {
              min_distance = dist
            }
          }
        }
        distList += Tuple2(min_distance, trajectory_id)
      }
    }
    distList = distList.sorted
    for (index <- 0 until neighbors) {
      data += distList(index)._2
    }

    val resultDF =
      data
        .toDF("trajectory_id")
    resultDF.coalesce(1).write.mode(SaveMode.Overwrite).json(outputfilepath)
  }


}
