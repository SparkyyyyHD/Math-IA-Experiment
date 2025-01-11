document.getElementById("correctText").hidden = true;
document.getElementById("incorrectText").hidden = true;
var canvas = document.getElementById("taskCanvas");
canvas.width  = window.innerWidth;
canvas.height = window.innerHeight;
var ctx = canvas.getContext("2d");
var star = document.getElementById("star");
var sleepResolve = false;
const trials = 150;

Promise.all(Array.from(document.images).filter(img => !img.complete).map(img => new Promise(resolve => { img.onload = img.onerror = resolve; }))).then(() => {
    console.log('images finished loading');
});

function sleep(ms, cancelable = false) {
    return new Promise(resolve => {
        let timeout;
        if (cancelable) {
            timeout = setTimeout(resolve, ms);
            
            document.addEventListener("keydown", function onKeyPress(event) {
                if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
                    clearTimeout(timeout);
                    resolve(); 
                    document.removeEventListener("keydown", onKeyPress);
                }
            });
        } else {
            setTimeout(resolve, ms);
        }
    });
}

function getRandomNumber(min, max) {
    return Math.random() * (max - min) + min;
}

function clear(){
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function drawSetup(){
    ctx.beginPath();
    ctx.lineWidth = 3;
    ctx.rect(canvas.width/3-100, canvas.height/2-100, 200, 200);
    ctx.rect(2*canvas.width/3-100, canvas.height/2-100, 200, 200);
    ctx.stroke();
    ctx.beginPath();
    ctx.rect(canvas.width/2-25, canvas.height/2-5, 50, 10);
    ctx.rect(canvas.width/2-5, canvas.height/2-25, 10, 50);
    ctx.fill();
}

function targetLeft(){
    ctx.beginPath();
    ctx.drawImage(star, canvas.width/3-50, canvas.height/2-50, 100, 100);
}

function targetRight(){
    ctx.beginPath();
    ctx.drawImage(star, 2*canvas.width/3-50, canvas.height/2-50, 100, 100);
}

async function cueLeft(){
    ctx.beginPath();
    ctx.lineWidth = 10;
    ctx.roundRect(canvas.width/3-100, canvas.height/2-100, 200, 200, 10);
    ctx.stroke();
    await sleep(100);
    clear();
    drawSetup();
}

async function cueRight(){
    ctx.beginPath();
    ctx.lineWidth = 10;
    ctx.roundRect(2*canvas.width/3-100, canvas.height/2-100, 200, 200, 10);
    ctx.stroke();
    await sleep(100);
    clear();
    drawSetup();
}

var score = 0;
var correct = false;
var accuracy;
var avg_correct_rt = 0;
var avg_incorrect_rt = 0;

async function start() {
    drawSetup();
    await sleep(2000);
    for(let i = 0; i < trials; i++) {
        var leftTarget = false;
        var leftCue = false;
        
        if(Math.random() > 0.5) leftTarget = true;
        else leftTarget = false;
        
        if (leftTarget) {
            if (Math.random() > 0.2) leftCue = true;
            else leftCue = false;
        } else {
            if (Math.random() > 0.2) leftCue = false;
            else leftCue = true;
        }
        let startTime;
        let reactionTime = null;
        if (leftCue) {
            await cueLeft();
            await sleep(getRandomNumber(50, 300));
            if (leftTarget) targetLeft();
            else targetRight(); 

            startTime = performance.now();
            function onKeyPress(event) {
                if (event.key === "ArrowLeft") {
                    if(leftTarget){
                        const endTime = performance.now();
                        reactionTime = endTime-startTime;
                        score++;
                        correct = true;
                        document.removeEventListener("keydown", onKeyPress); 
                    }
                    else{
                        const endTime = performance.now();
                        reactionTime = endTime-startTime;
                        correct = false;
                        document.removeEventListener("keydown", onKeyPress);
                    }
                }
                if (event.key === "ArrowRight") {
                    if(leftTarget){
                        const endTime = performance.now();
                        reactionTime = endTime-startTime;
                        correct = false;
                        document.removeEventListener("keydown", onKeyPress);
                    }
                    else{
                        const endTime = performance.now();
                        reactionTime = endTime-startTime;
                        score++;
                        correct = true;
                        document.removeEventListener("keydown", onKeyPress); 
                    }
                }
            }
            document.addEventListener("keydown", onKeyPress);
        } else {
            await cueRight();
            await sleep(getRandomNumber(50, 300));
            if (!leftTarget) targetRight();
            else targetLeft(); 
            startTime = performance.now();
            function onKeyPress(event) {
                if (event.key === "ArrowRight") {
                    if(!leftTarget){
                        const endTime = performance.now();
                        reactionTime = endTime-startTime;
                        score++;
                        correct = true;
                        document.removeEventListener("keydown", onKeyPress); 
                    }
                    else{
                        const endTime = performance.now();
                        reactionTime = endTime-startTime;
                        correct = false;
                        document.removeEventListener("keydown", onKeyPress);
                    }
                }
                if (event.key === "ArrowLeft") {
                    if(!leftTarget){
                        const endTime = performance.now();
                        reactionTime = endTime-startTime;
                        correct = false;
                        document.removeEventListener("keydown", onKeyPress);
                    }
                    else{
                        const endTime = performance.now();
                        reactionTime = endTime-startTime;
                        score++;
                        correct = true;
                        document.removeEventListener("keydown", onKeyPress); 
                    }
                }
            }
            document.addEventListener("keydown", onKeyPress);
        }

        await sleep(2000, true); 
        if (reactionTime === null) reactionTime = 2000;
        clear();
        drawSetup();
        if(correct){
            console.log("correct");
            avg_correct_rt += reactionTime;
            document.getElementById("correctText").hidden = false;
        }
        else{
            avg_incorrect_rt += reactionTime;
            console.log("incorrect");
            document.getElementById("incorrectText").hidden = false;
        }
        console.log(`Reaction time: ${reactionTime.toFixed(3)} ms`);
        await sleep(1500);
        document.getElementById("correctText").hidden = true;
        document.getElementById("incorrectText").hidden = true;
    }
    console.log(score);
    accuracy = score/trials*100;
    avg_correct_rt/=score;
    avg_incorrect_rt/=(trials-score);
    clear();
    document.getElementById("endText").style.display = "block";
    document.getElementById("endText").innerHTML=`Accuracy: ${accuracy.toFixed(2)}%<br>Average Correct Reaction time: ${avg_correct_rt.toFixed(3)} ms<br>Average Incorrect Reaction Time: ${avg_incorrect_rt.toFixed(3)} ms`;
}

start();
