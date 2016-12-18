var moveCard = function(selector, itr, ease){
    "use strict";

    var options = {
        settings: {
            displayBox:"vjs-providers", // Only change if display box class is different
            totalIterations: 100, // Speed up or slow down animation
            easeFunction: 'easeInOutCirc'
        },
        // variables that have to be gloabal 
        value: {iteration:0,changeValue:0,displayPos:0,providerPos:0,easingValue:undefined},
        ease: {
            // Ease functions credit: http://kirupa.googlecode.com/svn/trunk/easing.js
            // x: Current Iteration s: Start Value c: Change In Value t: Total Iterations
            // Use to create a lively animation
            easeInOutCirc: function(x,s,c,t){
                if((x/=t/2)<1){return c/2*(1-Math.sqrt(1-x*x))+s;};
                return c/2*(Math.sqrt(1-(x-=2)*x)+1)+s;
            },
            easeInQuad: function(x,s,c,t){
                return c*(x/=t)*x+s;
            },
            easeInOutSine: function(x,s,c,t){
                return c/2*(1-Math.cos(Math.PI*x/t))+s;
            },
            easeInOutExpo: function(x,s,c,t){
                if ((x/=t/2)<1){return c/2*Math.pow(2,10*(x-1))+s;};
                return c/2*(-Math.pow(2,-10*--x)+2)+s;
            },
            easeOutCirc: function(x,s,c,t){
                return c*Math.sqrt(1-(x=x/t-1)*x)+s;
            },
            easeOutCubic: function(x,s,c,t){
                return c*(Math.pow(x/t-1,3)+1)+s;
            }
        }
    };
    
    // Function for recall of the animation
    var requestAnimationFrame = window.requestAnimationFrame || 
                                window.mozRequestAnimationFrame || 
                                window.webkitRequestAnimationFrame || 
                                window.msRequestAnimationFrame;

    //  Logic starts here and prepares every thing for animation
    this.cardLoadLogic = function(cardProvider, itr, ease) {
        options.settings.totalIterations = itr; // set iteration value into a useable scope
        options.settings.easeFunction = ease; // set ease function into a useable scope
        options.value.displayPos = this.grabClassPos(options.settings.displayBox);
        if (options.value.displayPos == '')
            options.value.displayPos = 0;
        if (!options.value.easingValue)
            options.value.easingValue = options.value.displayPos;
        if (cardProvider) {
            options.value.providerPos = this.grabIdPos(cardProvider);
            options.value.changeValue = this.changeInValue(options.value.providerPos, options.value.displayPos);
            this.animateCard();
        } else {
            console.log("Error: No card provider defined");
        };
    };

    // Animation starts and executes here onlys
    this.animateCard = function animation() {
        if (options.value.providerPos !== options.value.displayPos) {
            options.value.easingValue = options.ease[options.settings.easeFunction](options.value.iteration, options.value.displayPos, options.value.changeValue, options.settings.totalIterations);
            document.getElementsByClassName(options.settings.displayBox)[0].style.top = Math.round(options.value.easingValue) + "px";
                if (options.value.iteration <= options.settings.totalIterations) {
                    options.value.iteration++;
                    requestAnimationFrame(animation);
                } else {
                    options.value.iteration = 0;
                };
            };
    };

    // Gets the position for the displayBox class element and out puts a raw number with no px
    this.grabClassPos = function(x) {
        var y = document.getElementsByClassName(x)[0].style.top,
            z = y.replace(/\D/g,'');
        if(z == 0){
            // Do nothing
        }else if(z == -0){
            z = 0;
        }else {
            z = parseInt("-" + z);
        };
        return z;
    };

    // Gets the position for the cardProvider Id and outputs a raw number with no px
    this.grabIdPos = function(x) {
        var y = document.getElementById(x).offsetTop;
        if(y == 0){
            // Do Nothing
        }else{
            y = parseInt("-" + y);
        };
        return y;
    };

    // Calculates the difference in value between the current position and the next
    this.changeInValue = function(x, y) {
        var z = parseInt(y - x);
        if(z < 0){
            return Math.abs(z);
        }else{
            return parseInt("-" + z);
        }
    };

    this.cardLoadLogic(selector, itr, ease);
};