const express = require('express');
const bodyParser = require("body-parser");
const cors = require('cors');
var fs = require('fs');
const app = express();
const XLSX = require('xlsx')
const csvFilePath = './WeHealth.xlsx'
app.use(cors());
//Import the module:

var DecisionTree = require('decision-tree');

function load_data(file) {
    var wb = XLSX.readFile(file);
    /* generate array of arrays */
    data = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { header: 1 });
    console.log(data, data.length);
    let filtered_data = data.filter((arr) => {
        return arr.length !== 0;
    })
    console.log(filtered_data)
    return format_data(filtered_data);
}

function format_data(arr) {
    console.log(arr);
    let coloumn_name = arr[0];
    let formatted_data = []
    for (let i = 1; i < arr.length; i++) {
        let obj = {};
        for (let j = 0; j < coloumn_name.length; j++) {
            obj[coloumn_name[j]] = data[i][j];
        }
        if (i % 2 == 0)
            obj["is_danger"] = true
        else
            obj["is_danger"] = false
        formatted_data.push(obj);
    }
    console.log(formatted_data);
    return formatted_data;
}

//Prepare training dataset:
const decision_tree = (obj) => {
    var training_data = load_data(csvFilePath);

    //Prepare test dataset:

    // var test_data = [
    //     { "glucose": "14", "ketone": "3", "is_danger": false },
    //     { "glucose": "red", "ketone": "3", "is_danger": false },
    //     { "glucose": "0.5", "ketone": "3", "is_danger": false },
    //     { "glucose": "0.5", "ketone": "5", "is_danger": false }
    // ];

    //Setup Target Class used for prediction:

    var class_name = "is_danger";

    //Setup Features to be used by decision tree:

    var features = ["glucose", "ketone", "Billrubin", "SpecificGravity", "RedCells", "pH", "Protein", "Urobilinogen", "Nitrite", "Leucocytes"];

    //Create decision tree and train model:

    var dt = new DecisionTree(training_data, class_name, features);

    //Predict class label for an instance:

    var predicted_class = dt.predict(obj);

    return predicted_class;

    //Evaluate model on a dataset:

    // var accuracy = dt.evaluate(test_data);

    // //Export underlying model for visualization or inspection:

    // var treeModel = dt.toJSON();
}




//accepting JSON
app.use(bodyParser.json({ extended: true }));

// Insert products
app.post('/result', (req, res) => {
    console.log(req.body)
    res.send(decision_tree(req.body));
});

app.listen('9000', () => {
    console.log('Server started on port 9000');
});