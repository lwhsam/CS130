/*
    Hints: 
    1. Attach click event handlers to all four of the 
       buttons (#default, #ocean, #desert, and #high-contrast).
    2. Modify the className property of the body tag 
       based on the button that was clicked.
*/

const toDefault = () => {
   document.querySelector("body").className = "";   
}

const toOcean = () => {
   document.querySelector("body").className = "ocean";
   console.log('WHYYYYY');   
};

const toDesert = () => {
   document.querySelector("body").className = "desert";   
}

const toContrast = () => {
   document.querySelector("body").className = "high-contrast";   
}

document.querySelector('#default').addEventListener('click', toDefault);
document.querySelector('#ocean').addEventListener('click', toOcean);
document.querySelector('#desert').addEventListener('click', toDesert);
document.querySelector('#high-contrast').addEventListener('click', toContrast);