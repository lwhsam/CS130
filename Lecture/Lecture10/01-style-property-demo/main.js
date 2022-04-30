const resetButtonColor = () => {
    document.querySelector("#btn1").style.color = "black";
    document.querySelector("#btn2").style.color = "black";
    document.querySelector("#btn3").style.color = "black";
    document.querySelector("#btn4").style.color = "black";

}

const makeRed = () => {
    // your code here...
    console.log('Change background to red');
    document.querySelector("body").style.backgroundColor = "red";
    resetButtonColor ()
    document.querySelector("#btn1").style.color = "red";
};


const makeBlue = () => {
    // your code here...
    console.log('Change background to blue');
    document.querySelector("body").style.backgroundColor = "blue";
    resetButtonColor ()
    document.querySelector("#btn2").style.color = "blue";
};

const makePink = () => {
    // your code here...
    console.log('Change background to pink');
    document.querySelector("body").style.backgroundColor = "hotpink";
    resetButtonColor ()
    document.querySelector("#btn3").style.color = "hotpink";
};

const makeOrange = () => {
    // your code here...
    console.log('Change background to orange');
    document.querySelector("body").style.backgroundColor = "orange";
    resetButtonColor ()
    document.querySelector("#btn4").style.color = "orange";
    // resetButtonColor () *order matters, reset put here will not show the button orange*
};

