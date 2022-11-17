from flask import Flask, request
import subprocess
import json
import glob 
import uuid
import shutil
import os

app = Flask(__name__)


@app.route('/loadTrajectoryData/', methods=['GET', 'POST'])
def loadTrajectoryData():
    outputfilepath = uuid.uuid4().hex
    data = request.args['inputpath']
    inputfilepath="./data/simulated_trajectories.json"
    command = "$SPARK_HOME/bin/spark-submit ./target/scala-2.12/SDSE-Phase-1-assembly-0.1.jar ./data/output/{} get-data {}".format(outputfilepath, inputfilepath)
    process = subprocess.Popen(command, shell=True, stdout=subprocess.PIPE)
    process.wait()
    print(process.returncode)
    outputList = []
    path = "./data/output/{}/*.json".format(outputfilepath)
    for filename in glob.glob(path):
        with open(filename) as f:
            for jsonObj in f:
                jsonDict = json.loads(jsonObj)
                outputList.append(jsonDict)
    shutil.rmtree("./data/output/{}".format(outputfilepath))
    jsonOutput = json.dumps(outputList)
    # with open("./data/output/sample.json", "w") as outfile:
    #     outfile.write(jsonOutput)
    return jsonOutput

@app.route('/getSpatialRange/', methods=['GET'])
def getSpatialRange():
    data = request.args
    start_latitude = data['start_latitude']
    end_latitude = data['end_latitude']
    start_longitude = data['start_longitude']
    end_longitude = data['end_longitude']
    inputfilepath = data['inputpath']
    outputfilepath = uuid.uuid4().hex

    command = "$SPARK_HOME/bin/spark-submit ./target/scala-2.12/SDSE-Phase-1-assembly-0.1.jar ./data/output/{} get-spatial-range {} {} {} {} {}".format(outputfilepath,start_latitude,start_longitude,end_latitude,end_longitude,inputfilepath)
    process = subprocess.Popen(command, shell=True, stdout=subprocess.PIPE)
    process.wait()
    print(process.returncode)
    outputList = []

    path = "./data/output/{}/*.json".format(outputfilepath)
    for filename in glob.glob(path):
        with open(filename) as f:
            for jsonObj in f:
                jsonDict = json.loads(jsonObj)
                outputList.append(jsonDict)
    shutil.rmtree("./data/output/{}".format(outputfilepath))
    return json.dumps(outputList)    

@app.route('/getSpatialTemporalRange/', methods=['GET'])
def getSpatialTemporalRange():
    data = request.args
    start_time = data['start_time']
    end_time = data['end_time']
    start_latitude = data['start_latitude']
    end_latitude = data['end_latitude']
    start_longitude = data['start_longitude']
    end_longitude = data['end_longitude']
    inputfilepath = data['inputpath']
    outputfilepath = uuid.uuid4().hex

    command = "$SPARK_HOME/bin/spark-submit ./target/scala-2.12/SDSE-Phase-1-assembly-0.1.jar ./data/output/{} get-spatiotemporal-range {} {} {} {} {} {} {}".format(outputfilepath,start_time, end_time,start_latitude,start_longitude,end_latitude,end_longitude,inputfilepath)
    process = subprocess.Popen(command, shell=True, stdout=subprocess.PIPE)
    process.wait()
    print(process.returncode)
    outputList = []

    path = "./data/output/{}/*.json".format(outputfilepath)
    for filename in glob.glob(path):
        with open(filename) as f:
            for jsonObj in f:
                jsonDict = json.loads(jsonObj)
                outputList.append(jsonDict)
    shutil.rmtree("./data/output/{}".format(outputfilepath))
    return json.dumps(outputList)     

@app.route('/getKNN/', methods=['GET'])
def getKNN():
    data = request.args
    trajectory_id = data['trajectory_id']
    k = data['k']
    inputfilepath = data['inputpath']
    outputfilepath = uuid.uuid4().hex
    command = "$SPARK_HOME/bin/spark-submit ./target/scala-2.12/SDSE-Phase-1-assembly-0.1.jar ./data/output/{} get-knn {} {} {}".format(outputfilepath,trajectory_id, k,inputfilepath)
    process = subprocess.Popen(command, shell=True, stdout=subprocess.PIPE)
    process.wait()
    print(process.returncode)
    outputList = []

    path = "./data/output/{}/*.json".format(outputfilepath)
    for filename in glob.glob(path):
        with open(filename) as f:
            for jsonObj in f:
                jsonDict = json.loads(jsonObj)
                outputList.append(jsonDict)
    shutil.rmtree("./data/output/{}".format(outputfilepath))
    return json.dumps(outputList)      

app.run()