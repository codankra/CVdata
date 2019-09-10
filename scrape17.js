const axios = require('axios');
const fs = require('fs-extra');
const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const algorithmNames = require("./AlgorithmNames.json");

// returns list of tuple [methodName,methodUrl]
const findAlgorithms = (table) => {
    let ret = []
    for (let i = 0; i < table.rows.length; ++i){
        let row = table.rows[i];
        let methodName, methodUrl;
        try{
            methodName = row.cells[1].getElementsByTagName("a")[0].textContent;
            methodUrl = row.cells[1].getElementsByTagName("a")[0].href;
        }
        catch(e){
            // Row does not have a link 
            continue;
        }
        if (algorithmNames.includes(methodName)){
            ret.push([methodName,methodUrl]);
            if (ret.length == algorithmNames.length){
                break;
            }
        }
    }
    if (ret.length!=algorithmNames.length){
        throw 'Error: Found incorrect number of algorithms'
    }
    return ret;
}

async function main(){
    const imgTypes = [/* "image_0", */"disp_ipol", "errors_img"];
    const NUM_TESTS = 20;
    const softCodeUrl = "http://www.cvlibs.net/datasets/kitti/"; //to make it easier to change referenced website

    const startURL = softCodeUrl + "eval_stereo_flow.php?benchmark=stereo";
    // To add to base for images of a specific submission: ${submissionID}/${imgType}_0/${testName}_10.png ; testName: 00...#

    const fullpage = await axios.get(startURL, {}); //get resources to parse table of submissions
  
    const { document } = (new JSDOM(String(fullpage.data))).window;
   
    const table = document.querySelector("table");
    for(let i = 0; i < table.tBodies.length; i++) {
        const tbody =  table.tBodies[i];

        //formula: 2r - 1 where r is rank
        //Choose algorithms according to method name
        let algorithmNames = findAlgorithms(tbody);
        for (let j = 0; j < algorithmNames.length; j++) {
            const methodName = algorithmNames[j][0];
            console.log(methodName);
            
            const thref = algorithmNames[j][1];
            const sPart = thref.lastIndexOf('=');
            const submissionID = thref.substring(sPart + 1);

            //this is where the magic happens
            let dir = `./images_2012/${methodName}`;
            if (!fs.existsSync(dir))
                fs.mkdirpSync(dir);
            //file creation code for storing table data
            const methodpageURL = softCodeUrl + thref; //needed for getting tables from this page
            console.log("Currently scraping " + methodName + " from \n" + methodpageURL); //correct URL
            const methodpage = await axios.get(methodpageURL, {}); //get resources to parse table of submissions - same way as above
            const { window } = new JSDOM(methodpage.data);
            const tables = window.document.querySelectorAll("table.results");

            const colheaders = ["Error", "D1-bg", "D1-fg", "D1-all"]; //save for later

            fs.appendFileSync(dir + `/tableData.txt`, `Test Averages:`);
            for(let i = 0; i < tables[0].tBodies.length; i++) {
                const tbody = tables[0].tBodies[i];
                for (let j = 1; j < tbody.rows.length; j++) { //skip header row
                    const row = tbody.rows[j];
                    for (let k = 1; k < row.cells.length; k++) {
                        const dataP = row.cells[k].textContent;
                        fs.appendFileSync(dir + `/tableData.txt`, `\t${dataP}`);
                    }
                }
            }
            fs.appendFileSync(dir + `/tableData.txt`, `\n`);
            for (let curTab = 1; curTab < tables.length; curTab++) {
                const currentTable = tables[curTab];
                fs.appendFileSync(dir + `/tableData.txt`, `Test#${(curTab-1)}:`);
                for(let i = 0; i < currentTable.tBodies.length; i++) {
                    const tbody = currentTable.tBodies[i];
                    for (let j = 1; j < tbody.rows.length; j++) { //skip header row
                        const row = tbody.rows[j];
                        for (let k = 1; k < row.cells.length; k++) {
                            const dataP = row.cells[k].textContent;
                            fs.appendFileSync(dir + `/tableData.txt`, `\t${dataP}`);
                        }
                    }
                }
                fs.appendFileSync(dir + `/tableData.txt`, `\n`);
            }
            //console.log("appended to file for method");
            //Image download code
            for (let i = 0; i < imgTypes.length; i++) {
                for (let testNum = 0; testNum < NUM_TESTS; testNum++) {
                    const testStr = `000000${testNum}`;
                    const testName = testStr.substring(testStr.length - 6); //make sure # part of url is of exactly length 6
                    const imgURL = `${softCodeUrl}results/${submissionID}/${imgTypes[i]}/${testName}_10.png`;
                    //^ example of a submission
                    const res = await axios.get(imgURL, {responseType: 'stream'}); //download image data to res
                    res.data.pipe(fs.createWriteStream(dir + `/${testNum}_${imgTypes[i]}.png`)); //save in local machine
                }
            }
        }
    }
}
main();
