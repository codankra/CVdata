const axios = require('axios');
var fs = require('fs-extra');




async function main(){
    const imgTypes = ["image", "result_disp_img", "errors_disp_img"];
    const NUM_TESTS = 20;
    const startURL = "http://www.cvlibs.net/datasets/kitti/eval_scene_flow.php?benchmark=stereo";
    const baseURL = "http://www.cvlibs.net/datasets/kitti/results/";
    // To add to base for images of a specific submission: ${submissionID}/${imgType}_0/${testName}_10.png ; testName: 00...#

    let dir = './images/tmp';
    if (!fs.existsSync(dir))
        fs.mkdirpSync(dir);
    // process.chdir('./nextDir'); vs dir = "fullpath"; every time you want to change directory
    for (let i = 0; i < imgTypes.length; i++) {
        for (let testNum = 0; testNum < NUM_TESTS; testNum++) {
            const testStr = `000000${testNum}`;
            const testName = testStr.substring(testStr.length - 6); //make sure # part of url is of exactly length 6
            const imgURL = `http://www.cvlibs.net/datasets/kitti/results/8f615398fb78fef43a0964df6f361b7589ae9b4b/${imgTypes[i]}_0/${testName}_10.png`;
            //^ example of a submission
            const res = await axios.get(imgURL, {responseType: 'stream'}); //download image data to res
            res.data.pipe(fs.createWriteStream(dir + `/${imgTypes[i]}${testNum}.png`)); //save in local machine
        }
    }
}
main();