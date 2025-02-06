//      skola24 Timetable Reskin

// Use browser.runtime if available (Firefox) or fallback to chrome.runtime (Chrome)
const runtime = (typeof browser !== 'undefined' && browser.runtime) ? browser.runtime : chrome.runtime;
const configUrl = runtime.getURL("config.json");

// Config
window.addEventListener('load', function () {
    fetch(configUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error(`Failed to fetch config.json: ${response.statusText}`);
            }
            return response.json();
        })
        .then(config => {
            console.log("Config loaded:", config);

            const root = document.documentElement;
            root.style.setProperty("--background-color", config["colors"]["backgroundColor"]);
            root.style.setProperty("--second-background-color", config["colors"]["secondBackgroundColor"]);
            root.style.setProperty("--hover-second-background-color", config["colors"]["hoverSecondBackgroundColor"]);
            root.style.setProperty("--hover-lighter-second-background-color", config["colors"]["hoverLighterSecondBackgroundColor"]);
            root.style.setProperty("--pass-through-highlight-color", config["colors"]["passThroughHighlightColor"]);
            root.style.setProperty("--graphics-color", config["colors"]["graphicsColor"]);
            root.style.setProperty("--highlight-color", config["colors"]["highlightColor"]);
            root.style.setProperty("--light-highlight-color", config["colors"]["lightHighlightColor"]);
        })
        .catch(error => {
            console.error("Error loading config.json:", error);
        });
});
  

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
        const header = document.querySelector(".w-page-header");
        if (header) {
          header.style.display = "none";
        } else {
          console.warn("Could not find element with class .w-page-header");
        }
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
        // Remove any existing favicon link elements
        document.querySelectorAll('link[rel="icon"], link[rel="shortcut icon"]').forEach(link => link.remove());
      
        // Get the URL to the favicon within your extension
        const faviconURL = runtime.getURL('assets/favicon.ico');
        const link = document.createElement("link");
        link.rel = "icon";
        link.type = "image/x-icon";
        link.href = faviconURL;
        
        document.head.appendChild(link);
    }
      
    
    injectFavicon();


    // General Page Styling
    let timetableWrapper;
    let slider;

    function waitForFlexBetween(callback) {
        const wFlexBetween = document.querySelector(".w-flex-between");
        if (wFlexBetween && wFlexBetween.children[0]) {
        // Element is available, call the callback and pass it
        callback(wFlexBetween);
        } else {
        // Check again after a short delay
        setTimeout(() => waitForFlexBetween(callback), 100);
        }
    }
    
    // Call the function with a callback that contains the code that depends on wFlexBetween
    waitForFlexBetween(function(wFlexBetween) {
        // Now that we know wFlexBetween exists, we can safely access it
        wFlexBetween.children[0].innerHTML = "Timetable";
    
        // Continue with your dependent code:
        const wTimetableImg = document.querySelector(".w-timetable img");
        if (wTimetableImg) {
        wTimetableImg.style.display = "none";
        } else {
        console.warn("Could not find the timetable image element.");
        }
    
        const wContainerTimetable = document.querySelector(".w-page-content .w-container");
        if (wContainerTimetable && wContainerTimetable.children[1]) {
            const wPanelTimetable = wContainerTimetable.children[1];
            if (wPanelTimetable.children[0]) {
                timetableWrapper = wPanelTimetable.children[0];
                timetableWrapper.classList.add("timetable-wrapper");
            } else {
                console.warn("Could not find the timetable wrapper inside wPanelTimetable.");
            }
        } else {
        console.warn("Could not find wContainerTimetable or its expected child.");
        }
    });
  
    
    
    // Timetable SVG Styling
    let classSelection;
    let lastInputValue = "";

    let lessonColorHue = 0;

    // Continuously rotate the hue
    function rotateHue(lessonRects) {
        lessonColorHue = (lessonColorHue + 1) % 360; // Increment hue and loop back after 360
        lessonRects.forEach(rect => {
            rect.style.filter = `hue-rotate(${lessonColorHue}deg)`; // Apply the hue rotation
        });
        requestAnimationFrame(() => rotateHue(lessonRects)); // Continuously update
    }
    
    function styleTimetableSvg() {
        // Published Time Text
        const publishedText = timetableWrapper.children[1];
        publishedText.style.color = "var(--graphics-color)";
        publishedText.style.fontSize = "13px";

        // Timetable
        const rects = timetableWrapper.querySelectorAll("svg rect");
        const texts = timetableWrapper.querySelectorAll("svg text");

        rects[0].style.fill = "none";

        if (slider && slider.checked) {
            gsap.fromTo("rect", {opacity: 0}, {duration: 0.4, opacity: 1, stagger: 0.03, ease: "power1.inOut"});
            gsap.fromTo("text", {opacity: 0}, {duration: 0.4, opacity: 1, stagger: 0.01, ease: "power1.inOut"});
        }

        styleTexts = Array.from(texts).slice(0, 25);
 
        styleTexts.forEach(text => {
            text.style.fill = "var(--graphics-color)";
        })

        rects[6].style.fill = "var(--hover-second-background-color)";
        rects[6].style.strokeWidth = "0px";
        rects[11].style.fill = "var(--hover-second-background-color)";
        rects[11].style.strokeWidth = "0px";

        let dayLabelRects = Array.from(rects).slice(1, 6);

        dayLabelRects.forEach(rect => {
            rect.style.fill = "var(--hover-second-background-color)";
            rect.style.strokeWidth = "0px";
        })

        dayRects = Array.from(rects).slice(7, 11);
        dayRects.push(rects[12]);

        dayRects.forEach(rect => {
            rect.style.fill = "var(--second-background-color)";
        })

        let lessonRects = [];

        // Get every lesson rectangle, it has the box-type="Lesson" attribute
        rects.forEach(rect => {
            if (rect.getAttribute("box-type") === "Lesson") {
                lessonRects.push(rect);
            }
        })

        // Start the hue rotation animation
        //rotateHue(lessonRects);
    }


    function classInputChange() {
        if (classSelection) {
            const inputElement = classSelection.querySelector("input");
            if (inputElement) {
                const currentValue = inputElement.value;
                if (currentValue !== "" && currentValue !== lastInputValue) {
                    //console.log(currentValue);
                    lastInputValue = currentValue;

                    // Hide filters
                    const toggleDropdownButton = document.querySelector(".toggle-dropdown-button");
                    toggleDropdownButton.click();

                    waitForSvgAndStyle();
                }
            }
        }
    }

    function waitForSvgAndStyle() {
        if (!timetableWrapper) {
            console.warn("timetableWrapper not defined yet.");
            return;
        }

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
        //setTimeout(waitForSvgAndStyle, 50);
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

        function createSliderHtml() {
            const label = createElementWithClass("label", ["switch"]);
            const input = createElementWithClass("input", []);
            input.type = "checkbox";
            input.id = "slider";
            slider = input;  // Store the reference globally.
        
            label.append(input);
            label.append(createElementWithClass("span", ["slider"]));
        
            return label;
        }

        // Week num is buggy, fix when reaching the end of the year + end of available schedule time
        const weekNumText = createElementWithClass("p", ["week-num"]);

        function updateWeekNumText(week) {
            const weekNumBold = createElementWithClass("b", []);
            weekNumBold.innerHTML = week;
            weekNumText.innerHTML = "Week ";
            weekNumText.append(weekNumBold);
        }

        updateWeekNumText();

        leftContent.append(weekNumText);
        rightContent.append(createSliderHtml());

        // Create a dropdown for option inputs
        const wPanelFooter = document.querySelector(".w-panel-footer");
        const wPageHeader = document.querySelector(".w-page-header");
        const wHeaderContainer = wPageHeader.children[0];
        const wHeaderContent = wHeaderContainer.children[0];
        const wHeaderFlexRight = wHeaderContent.children[1];

        const dropdown = createElementWithClass("button", ["dropdown"]);
        dropdown.innerHTML = "&#8711;";
        wHeaderFlexRight.append(dropdown);
        dropdown.classList = "w-button w-mb0 w-button-action w-button-flat w-condensed toggle-dropdown-button";

        let isDropdownOpen = true;

        dropdown.onclick = function() {
            isDropdownOpen ? isDropdownOpen = false : isDropdownOpen = true;
            isDropdownOpen ? dropdown.innerHTML = "&#8711;" : dropdown.innerHTML = "&#916;";

            wPanelFooter.children[0].classList.toggle("display-none");
            wPageHeader.classList.toggle("mb-3");

            waitForSvgAndStyle();
        }

        const wHeaderFlexRightElems = Array.from(wHeaderFlexRight.children);

        // Hide the help button (it is unnecessary I believe)
        wHeaderFlexRightElems.forEach(elem => {
            const helpButton = elem.querySelector('[title="Gå till hjälp"]');
            if (helpButton) {
                helpButton.style.display = "none";
            }
        });

        /*
        // Refresh timetable styling when switching day/week
        const wButtonGroup = wPanelFooter.querySelector(".w-button-group");
        console.log(wButtonGroup);

        wButtonGroup.querySelector("li").onclick = function() {
            setTimeout(waitForSvgAndStyle, 500);
            //waitForSvgAndStyle();
        }
        */

        // Add the extra row
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
                    updateWeekNumText(weekNumber);

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
                    updateWeekNumText(weekNumber);

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

        // Init values
        updateCurrentWeek();
        // Get the weekNumber
        weekChange("next");
        weekChange("previous");

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