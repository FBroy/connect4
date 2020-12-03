window.onload = function() {

    if (document.cookie == "") {
        document.cookie = "Visits=0";
    } 
    else {
        let count = Number(document.cookie.split('=')[1]) + 1;
        document.cookie = "Visits=" + count;
    }
    console.log(document.cookie);

};

window.onresize = function() {
    if (window.innerHeight < 700 || window.innerWidth < 1000) {
        alert("Your resolution is too low, the minimal resolution is 1000x700");
    }
};