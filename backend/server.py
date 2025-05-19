from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
from dataClean import edit_nan_values

# Load data
data = pd.read_csv("./data.csv")
data["Status"] = data["Status"].map({"Developing":"0","Developed":"1"})

for i in range(3, len(data.columns)):
        col = data.columns[i]
        global_mean_value = data[col].mean()
        
        data = data.groupby('Country', group_keys=False).apply(
            lambda x: edit_nan_values(x, col, global_mean_value)
        )


app = Flask(__name__)
CORS(app)

@app.route("/", methods=["GET"])
def clean_data():
    global data  # to modify the oduter `data`
    region = request.args.get("region")
    mode = request.args.get('mode')
    if mode == "Developed":
          sendData = data[data["Status"] == "1"]
          print(len(sendData))
    elif mode == "Developing":
           sendData = data[data["Status"]=="0"]
           print(len(sendData))
    elif mode == "Both":
           sendData = data
    

              
              

    return jsonify(sendData["Country"].unique().tolist())

@app.route("/graph/<country>",methods=["GET"])
def get_graph_data(country):
    try:
        country_data = data[data["Country"] == country]
        country_data = country_data.sort_values(by="Year", ascending=True)

        result = {
            "years": country_data["Year"].tolist(),
            "status": country_data["Status"].tolist(),
            "lifeexp": country_data["Life expectancy "].tolist(),
            "admortal": country_data["Adult Mortality"].tolist(),
            "infdeath": country_data["infant deaths"].tolist(),
            "alcohol": country_data["Alcohol"].tolist(),
            "percexp": country_data["percentage expenditure"].tolist(),
            "hepatitis": country_data["Hepatitis B"].tolist(),
            "measles": country_data["Measles "].tolist(),
            "bmi": country_data[" BMI "].tolist(),
            "polio": country_data["Polio"].tolist(),
            "totalexp": country_data["Total expenditure"].tolist(),
            "diph": country_data["Diphtheria "].tolist(),
            "hiv": country_data[" HIV/AIDS"].tolist(),
            "gdp": country_data["GDP"].tolist(),
            "popu": country_data["Population"].tolist(),
            "incomeres": country_data["Income composition of resources"].tolist(),
            "sch": country_data["Schooling"].tolist()
        }
        print(result)
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 400

if __name__ == "__main__":
    app.run(debug=True)
