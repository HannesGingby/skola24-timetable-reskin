//      skola24 Timetable Reskin

// Utility
function createElementWithClass(element, classNames) {
    let newDiv = document.createElement(element);

    classNames.forEach(className => {
        newDiv.classList.add(className);
    });

    return newDiv;
}



const safetyDelay = 1000; //ms

window.addEventListener('load', function () {
    // Loading Screen
    const loadingScreen = createElementWithClass("div", ["reskin-loading-screen"]);
    const loadingText = createElementWithClass("p", ["reskin-loading-text"]);

    function initLoadingScreen() {
        document.querySelector(".w-page-header").style.display = "none";

        document.body.append(loadingScreen);
        loadingText.innerHTML = "loading...";
        loadingScreen.append(loadingText);
    }

    function removeLoadingScreen() {
        document.querySelector(".w-page-header").style.display = "unset";

        loadingScreen.style.display = "none";
    }

    initLoadingScreen();
    setTimeout(removeLoadingScreen, safetyDelay);


    // Favicon
    function injectFavicon() {
        const faviconURL = chrome.runtime.getURL('assets/favicon.ico');

        const link = document.createElement("link");
        link.rel = "icon";
        link.type = "image/x-icon";
        link.href = faviconURL;
    
        document.head.appendChild(link);
    }
    
    injectFavicon();



    // General Page Styling
    const wFlexBetween = document.querySelector(".w-flex-between");
    wFlexBetween.children[0].innerHTML = "Timetable";

    document.querySelector(".w-timetable img").style.display = "none";

    const wContainerTimetable = document.querySelector(".w-page-content .w-container");
    const wPanelTimetable = wContainerTimetable.children[1];
    const timetableWrapper = wPanelTimetable.children[0];
    timetableWrapper.classList.add("timetable-wrapper");
    
    
    // Timetable SVG Styling
    let classSelection;
    let lastInputValue = "";
    
    function styleTimetableSvg() {
        // Published Time Text
        const publishedText = timetableWrapper.children[1];
        publishedText.style.color = "var(--graphics-color)";
        publishedText.style.fontSize = "13px";

        // Timetable
        const rects = timetableWrapper.querySelectorAll("svg rect");
        const texts = timetableWrapper.querySelectorAll("svg text");

        rects[0].style.fill = "none";

        if (slider.checked == true) {
            gsap.fromTo("rect", {opacity:0}, {duration: 0.4, opacity:1, stagger: 0.03, ease: "power1.inOut"});
            gsap.fromTo("text", {opacity:0}, {duration: 0.4, opacity:1, stagger: 0.01, ease: "power1.inOut"});
        }

        styleTexts = Array.from(texts).slice(0, 25);
 
        styleTexts.forEach(text => {
            text.style.fill = "var(--graphics-color)";
        })

        rects[6].style.fill = "var(--hover-second-background-color)";
        rects[6].style.strokeWidth = "0px";
        rects[11].style.fill = "var(--hover-second-background-color)";
        rects[11].style.strokeWidth = "0px";

        dayLabelRects = Array.from(rects).slice(1, 6);

        dayLabelRects.forEach(rect => {
            rect.style.fill = "var(--hover-second-background-color)";
            rect.style.strokeWidth = "0px";
        })

        dayRects = Array.from(rects).slice(7, 11);
        dayRects.push(rects[12]);

        dayRects.forEach(rect => {
            rect.style.fill = "var(--second-background-color)";
        })

        /*
        lessonRects = Array.from(rects).slice(13, 37);

        lessonRects.forEach(rect => {
            rect.style.fill = "var(--second-background-color)";
        })
        */
    }


    function classInputChange() {
        if (classSelection) {
            const inputElement = classSelection.querySelector("input");
            if (inputElement) {
                const currentValue = inputElement.value;
                if (currentValue !== "" && currentValue !== lastInputValue) {
                    console.log(currentValue);
                    lastInputValue = currentValue;

                    waitForSvgAndStyle();
                }
            }
        }
    }

    function waitForSvgAndStyle() {
        const observer = new MutationObserver((mutationsList, observer) => {
            for (const mutation of mutationsList) {
                if (mutation.type === 'childList') {
                    const svgElement = timetableWrapper.querySelector("svg");
                    if (svgElement) {
                        observer.disconnect(); // Stop observing once SVG is found
                        styleTimetableSvg();
                    }
                }
            }
        });
    
        // Start observing the timetableWrapper for childList changes
        observer.observe(timetableWrapper, { childList: true, subtree: true });
    }

    window.onresize = function() {
        waitForSvgAndStyle();
        //console.log("Resized window");
    };


    function loadTimeout() {
        classSelection = document.querySelector('[data-identifier="KlassSelection"]');

        if (classSelection) {
            // Create a MutationObserver to watch for changes to the classSelection element
            const observer = new MutationObserver((mutationsList) => {
                for (const mutation of mutationsList) {
                    if (mutation.type === 'childList' || mutation.type === 'attributes') {
                        classInputChange();
                    }
                }
            });

            // Configure the observer to watch for child changes and attribute changes
            observer.observe(classSelection, { childList: true, subtree: true, attributes: true });

            // Initial check
            classInputChange();
        }

        // GSAP Animations
        gsap.from(".w-page-header", {
            opacity: 0,
            duration: 1,
            ease: "power2.in"
        });

        gsap.from(".w-row", {
            opacity: 0,
            duration: 0.5,
            ease: "power1.in"
        })
        
        //  Create button elements for week switching
        const nextWeekButton = createElementWithClass("button", ["next-week-button"])
        nextWeekButton.innerHTML = "Next Week&nbsp;&nbsp;&nbsp;&#8618;";

        const previousWeekButton = createElementWithClass("button", ["previous-week-button"])
        previousWeekButton.innerHTML = "&#8617;&nbsp;&nbsp;&nbsp;Previous Week";

        const extraRow = createElementWithClass("div", ["w-s6" , "w-m3", "w-l2", "addition-row"]);

        const buttonWrapper = createElementWithClass("div", ["button-wrapper"]);
        buttonWrapper.append(previousWeekButton);
        buttonWrapper.append(nextWeekButton);

        const leftContent = createElementWithClass("div", ["left-content"]);
        const rightContent = createElementWithClass("div", ["right-content"]);

        extraRow.append(leftContent);
        extraRow.append(buttonWrapper);
        extraRow.append(rightContent);

        function getSliderHtml() {
            const label = createElementWithClass("label", ["switch"]);
            const input = createElementWithClass("input", []);
            input.type = "checkbox";
            input.id = "slider";

            label.append(input);
            label.append(createElementWithClass("span", ["slider"]));

            return label;
        }

        rightContent.append(getSliderHtml());

        // Add the extra row
        const wPanelFooter = document.querySelector(".w-panel-footer");
        wPanelFooter.children[1].append(extraRow);

        const inputRows = wPanelFooter.children[0];
        inputRows.children[6].style.display = "none";

        function weekChange(type) {
            if (type != "next" && type != "previous") {
                console.log("Invalid type paramater")
            } else {
                currentWeekLiElement.classList.remove("w-selected");

                if (type == "next") {
                    currentWeekDataValue++;
                    currentWeekLiElementIndex++;

                    weekNumber = Math.abs(currentWeekDataValue) % 100; // Last two digits (representing the week)

                    if (weekNumber >= 52) {
                        year++;
                        currentWeekDataValue = parseInt(year.toString() + "01");
                    }
                } else if (type == "previous") {
                    if (currentWeekLiElementIndex == 0) {
                        allowWeekChangePrevious = false;
                    } else {
                        allowWeekChangePrevious = true;
                    }

                    if (allowWeekChangePrevious) {
                        currentWeekDataValue--;
                        currentWeekLiElementIndex--;   
                    }

                    weekNumber = Math.abs(currentWeekDataValue) % 100;

                    if (weekNumber <= 0) {
                        year--;
                        currentWeekDataValue = parseInt(year.toString() + "52");
                    }
                }

                // Find the next week element in the dropdown menu
                const nextWeekLiElement = document.querySelector(`li[data-value="${currentWeekDataValue}"]`);
                nextWeekLiElement.classList.add("w-selected");
                
                // Update current week variables
                updateCurrentWeek();

                // Simulate a next week change by user so that is actually updates
                weekDropdownMenu.style = "";
                currentWeekLiElement.querySelector("a").click();
                weekDropdownMenu.style.display = "none";

                waitForSvgAndStyle();
            }
        }

        const weekInputWrapper = document.querySelector('[data-identifier="weekSelection"]');
        const weekDropdownMenu = weekInputWrapper.querySelector("ul");

        const dropdownLis = weekInputWrapper.querySelector("ul").querySelectorAll("li");
        const dropdownArray = Array.from(dropdownLis);
        let currentWeekDataValue;
        let currentWeekLiElement;
        let currentWeekLiElementIndex;

        let allowWeekChangePrevious = true;
        let weekNumber;

        function updateCurrentWeek() {
            // Use findIndex to find the index of the element with the class "w-selected"
            currentWeekLiElementIndex = dropdownArray.findIndex(element => element.classList.contains("w-selected"));

            if (currentWeekLiElementIndex !== -1) {
                currentWeekLiElement = dropdownArray[currentWeekLiElementIndex];
                currentWeekDataValue = parseInt(currentWeekLiElement.getAttribute("data-value"));

                //console.log("Element:", currentWeekLiElement);
                //console.log("Index:", currentWeekLiElementIndex);
                //console.log("Current data-value: " + currentWeekDataValue);
            } else {
                console.log("No element with the class 'w-selected' was found.");
            }
        }

        // Init values for the variables
        updateCurrentWeek();

        let yearString = Math.abs(currentWeekDataValue).toString();
        let year = parseInt(yearString.slice(0, 4));

        nextWeekButton.onclick = function() {
            weekChange("next");
        }

        previousWeekButton.onclick = function() {
            weekChange("previous");
        }
    }

    setTimeout(loadTimeout, safetyDelay);
})