const axios = require('axios');
const fs = require('fs-extra');
const jsdom = require("jsdom");
const { JSDOM } = jsdom;




async function main(){
    const imgTypes = ["image", "result_disp_img", "errors_disp_img"];
    const NUM_TESTS = 20;
    const softCodeUrl = "http://www.cvlibs.net/datasets/kitti/"; //to make it easier to change referenced website
    const startURL = softCodeUrl + "eval_scene_flow.php?benchmark=stereo";
    // To add to base for images of a specific submission: ${submissionID}/${imgType}_0/${testName}_10.png ; testName: 00...#

    const fullpage = await axios.get(startURL, {}); //get resources to parse table of submissions
    const { document } = (new JSDOM(String(fullpage.data))).window;
    // const titleP = document.getElementsByClassName("title");
    // console.log(titleP.length);
    // console.log(titleP[2].textContent);
    const table = document.querySelector("table");
    console.log(table.tBodies.length)
    for(var i = 0; i < table.tBodies.length; i++) {
        var tbody =  table.tBodies[i];
        var count = 0;
        console.log(tbody.rows.length);
        for (var j = 0; j < tbody.rows.length; j++) {
            var row = tbody.rows[j];
            if(j % 2 === 1){
                console.log(row.cells[1].getElementsByTagName("a")[0].textContent);
                count++;

            }
        }
    }
    console.log(count);
    // (HTMLTableRowElement.rowIndex % 2 === 1)
    // (HTMLTableRowElement.cells
    

    let dir = './images/tmp';
    if (!fs.existsSync(dir))
        fs.mkdirpSync(dir);
    // process.chdir('./nextDir'); vs dir = "fullpath"; every time you want to change directory
    // const submissionID = "8f615398fb78fef43a0964df6f361b7589ae9b4b"; //hardcoded for now
    // for (let i = 0; i < imgTypes.length; i++) {
    //     for (let testNum = 0; testNum < NUM_TESTS; testNum++) {
    //         const testStr = `000000${testNum}`;
    //         const testName = testStr.substring(testStr.length - 6); //make sure # part of url is of exactly length 6
    //         const imgURL = `${softCodeUrl}results/${submissionID}/${imgTypes[i]}_0/${testName}_10.png`;
    //         //^ example of a submission
    //         const res = await axios.get(imgURL, {responseType: 'stream'}); //download image data to res
    //         res.data.pipe(fs.createWriteStream(dir + `/${imgTypes[i]}${testNum}.png`)); //save in local machine
    //     }
    // }
}
main();