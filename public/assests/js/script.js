$(window).scroll(function () {
    var sc = $(window).scrollTop()
    if (sc > 50) {
        $("#header-sroll").addClass("navbar-onscroll")
    } else {
        $("#header-sroll").removeClass("navbar-onscroll")
    }
});

//Accordion Homepage
var acc = document.getElementsByClassName("accordion");
    var i;

    for (i = 0; i < acc.length; i++) {
    acc[i].addEventListener("click", function() {
        this.classList.toggle("active");
        var panel = this.nextElementSibling;
        if (panel.style.maxHeight) {
        panel.style.maxHeight = null;
        } else {
        panel.style.maxHeight = panel.scrollHeight + "px";
        } 
    });
}

//Animation
AOS.init();

//Accept Privacy Policy
function toggleClock() {
    var myClock = document.getElementById('clock');
    var displaySetting = myClock.style.display;

    // also get the clock button, so we can change what it says
    var clockButton = document.getElementById('clockButton');

    // now toggle the clock and the button text, depending on current state
    if (displaySetting == null) {
    // clock is visible. hide it
    myClock.style.display = 'block';
    }
    else {
    // clock is hidden. show it
    myClock.style.display = 'none';
    }
}