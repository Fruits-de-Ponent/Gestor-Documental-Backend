/* Imports */
require('dotenv').config();
const fileupload = require("express-fileupload");
const methodOverride = require('method-override');
const bodyParser = require('body-parser');
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const app = express();

/* Configuration */
app.use(bodyParser.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(express.json());
app.use(fileupload());
app.use(cors());

/* HTTP Methods */
app.get('/', (req, res) => {
    console.log(req.query)
    let fullPath = process.env.PATHTOFOLDER;
    let catchError = false;
    let content = ''; 
    let folders = []; 
    let files = [];
    if (req.query.path) fullPath = fullPath + req.query.path + '/';
    try {
        fullPath = decodeURI(fullPath);
        fullPath = fullPath.split('%20').join(' ')
        content = fs.readdirSync(fullPath);
        content.forEach(recurso => {
            if (fs.lstatSync(fullPath + recurso).isDirectory()) folders.push(recurso);
            else files.push(recurso);
        });
    } catch(error) {
        console.log('Error', error)
        catchError = true;
    };
    if (catchError) {
        res.status(200).json({
            success: false,
        });
    } else if (!catchError) {
        res.status(200).json({
            success: true,
            path: req.query.path,
            folders: folders,
            files: files
        });
        res.end();
    };
});

app.get('/download', (req, res) => {
    console.log(req.query)
    let fullPath = process.env.PATHTOFOLDER;
    if (req.query.path) fullPath = fullPath + req.query.path + '/';
    res.download(fullPath + req.query.download);
});

app.post('/', async (req, res) => {
    console.log(req.query, req.files)
    let fullPath = process.env.PATHTOFOLDER;
    if (req.query.path) fullPath = fullPath + req.query.path + '/';
    let catchError = false;
    try {
        if (req.files) {
            fullPath = decodeURI(fullPath);
            fullPath = fullPath.split('%20').join(' ')
            await req.files.file.mv(fullPath + req.files.file.name)
        } else if (req.query.folder) {
            fullPath = fullPath + req.query.folder;
            fullPath = decodeURI(fullPath);
            fullPath = fullPath.split('%20').join(' ')
            await fs.mkdirSync(fullPath)
        } 
    } catch(error) {
        console.log('Error', error)
        catchError = true;
    }
    if (catchError) {
        res.status(200).json({
            success: false,
        })
    } else if (!catchError) {
        res.status(200).json({
            success: true,
        });
    };
    res.end();
});

app.delete('/', async (req, res) => {
    console.log(req.query)
    let fullPath = process.env.PATHTOFOLDER;
    let catchError = false;
    if (req.query.path) fullPath = fullPath + req.query.path;
    try {
        if (req.query.file) {
            fullPath = fullPath + '/' + req.query.file;
            await fs.unlinkSync(fullPath);
        } else if (req.query.folder) {
            fullPath = fullPath + '/' + req.query.folder;
            if (fullPath.includes('//')) fullPath = fullPath.split('//').join('/');
            await fs.rmSync(fullPath, { recursive: true, force: true });
        };
    } catch(error) {
        console.log('Error', error);
        catchError = true;
    };
 
    if (catchError) {
        res.status(200).json({
            success: false,
        });
    } else if (!catchError){
        res.status(200).json({
            success: true,
        });
    };
    res.end();
});

app.listen(process.env.PORT, (err) => {
    if (err) console.log(err);
    console.log('API Desplegada:', `http://localhost:${process.env.PORT}`);
});