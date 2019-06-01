const axios = require('axios');
const fs = require('fs-extra');
const jsdom = require("jsdom");
const { JSDOM } = jsdom;




async function main(){
    const imgTypes = [/* "image", */"result_disp_img", "errors_disp_img"];
    const NUM_TESTS = 20;
    const softCodeUrl = "http://www.cvlibs.net/datasets/kitti/"; //to make it easier to change referenced website

    //process.chdir('./nextDir'); vs dir = "fullpath"; every time you want to change directory
    const exID = "8f615398fb78fef43a0964df6f361b7589ae9b4b"; //get initial images
    for (let testNum = 0; testNum < NUM_TESTS; testNum++) {
        let dir = `./images`;
        if (!fs.existsSync(dir))
            fs.mkdirpSync(dir);
        const testStr = `000000${testNum}`;
        const testName = testStr.substring(testStr.length - 6); //make sure # part of url is of exactly length 6
        const imgURL = `${softCodeUrl}results/${exID}/image_0/${testName}_10.png`;
        //^ example of a submission
        const res = await axios.get(imgURL, {responseType: 'stream'}); //download image data to res
        res.data.pipe(fs.createWriteStream(dir + `/img${testNum}.png`)); //save in local machine
    }

    
    const startURL = softCodeUrl + "eval_scene_flow.php?benchmark=stereo";
    // To add to base for images of a specific submission: ${submissionID}/${imgType}_0/${testName}_10.png ; testName: 00...#

    const fullpage = await axios.get(startURL, {}); //get resources to parse table of submissions
    const { document } = (new JSDOM(String(fullpage.data))).window;
    // const titleP = document.getElementsByClassName("title");
    // console.log(titleP.length);
    // console.log(titleP[2].textContent);
    const table = document.querySelector("table");
    for(var i = 0; i < table.tBodies.length; i++) {
        var tbody =  table.tBodies[i];
        for (var j = 0; j < tbody.rows.length; j++) {
            var row = tbody.rows[j];
            if(j % 2 === 1){
                const methodName = row.cells[1].getElementsByTagName("a")[0].textContent;
                const thref = row.cells[1].getElementsByTagName("a")[0].href;
                const sPart = thref.lastIndexOf('=');
                const submissionID = thref.substring(sPart + 1);
                const methodpageURL = softCodeUrl + thref;
                //this is where the magic happens
                let dir = `./images/${methodName}`;
                if (!fs.existsSync(dir))
                    fs.mkdirpSync(dir);
                for (let i = 0; i < imgTypes.length; i++) {
                    for (let testNum = 0; testNum < NUM_TESTS; testNum++) {
                        const testStr = `000000${testNum}`;
                        const testName = testStr.substring(testStr.length - 6); //make sure # part of url is of exactly length 6
                        const imgURL = `${softCodeUrl}results/${submissionID}/${imgTypes[i]}_0/${testName}_10.png`;
                        //^ example of a submission
                        const res = await axios.get(imgURL, {responseType: 'stream'}); //download image data to res
                        res.data.pipe(fs.createWriteStream(dir + `/${testNum}_${imgTypes[i]}.png`)); //save in local machine
                    }
                }

            }
        }
    }
}
main();