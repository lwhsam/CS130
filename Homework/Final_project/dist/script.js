//Timeline import js code
jQuery(document).ready(function ($) {
  var timelines = $(".cd-horizontal-timeline"),
    eventsMinDistance = 60;

  timelines.length > 0 && initTimeline(timelines);

  function initTimeline(timelines) {
    timelines.each(function () {
      var timeline = $(this),
        timelineComponents = {};
      //cache timeline components
      timelineComponents["timelineWrapper"] = timeline.find(".events-wrapper");
      timelineComponents["eventsWrapper"] =
        timelineComponents["timelineWrapper"].children(".events");
      timelineComponents["fillingLine"] =
        timelineComponents["eventsWrapper"].children(".filling-line");
      timelineComponents["timelineEvents"] =
        timelineComponents["eventsWrapper"].find("a");
      timelineComponents["timelineDates"] = parseDate(
        timelineComponents["timelineEvents"]
      );
      timelineComponents["eventsMinLapse"] = minLapse(
        timelineComponents["timelineDates"]
      );
      timelineComponents["timelineNavigation"] = timeline.find(
        ".cd-timeline-navigation"
      );
      timelineComponents["eventsContent"] =
        timeline.children(".events-content");

      //assign a left postion to the single events along the timeline
      setDatePosition(timelineComponents, eventsMinDistance);
      //assign a width to the timeline
      var timelineTotWidth = setTimelineWidth(
        timelineComponents,
        eventsMinDistance
      );
      //the timeline has been initialize - show it
      timeline.addClass("loaded");

      //detect click on the next arrow
      timelineComponents["timelineNavigation"].on(
        "click",
        ".next",
        function (event) {
          event.preventDefault();
          updateSlide(timelineComponents, timelineTotWidth, "next");
        }
      );
      //detect click on the prev arrow
      timelineComponents["timelineNavigation"].on(
        "click",
        ".prev",
        function (event) {
          event.preventDefault();
          updateSlide(timelineComponents, timelineTotWidth, "prev");
        }
      );
      //detect click on the a single event - show new event content
      timelineComponents["eventsWrapper"].on("click", "a", function (event) {
        event.preventDefault();
        timelineComponents["timelineEvents"].removeClass("selected");
        $(this).addClass("selected");
        updateOlderEvents($(this));
        updateFilling(
          $(this),
          timelineComponents["fillingLine"],
          timelineTotWidth
        );
        updateVisibleContent($(this), timelineComponents["eventsContent"]);
      });

      //on swipe, show next/prev event content
      timelineComponents["eventsContent"].on("swipeleft", function () {
        var mq = checkMQ();
        mq == "mobile" &&
          showNewContent(timelineComponents, timelineTotWidth, "next");
      });
      timelineComponents["eventsContent"].on("swiperight", function () {
        var mq = checkMQ();
        mq == "mobile" &&
          showNewContent(timelineComponents, timelineTotWidth, "prev");
      });

      //keyboard navigation
      $(document).keyup(function (event) {
        if (event.which == "37" && elementInViewport(timeline.get(0))) {
          showNewContent(timelineComponents, timelineTotWidth, "prev");
        } else if (event.which == "39" && elementInViewport(timeline.get(0))) {
          showNewContent(timelineComponents, timelineTotWidth, "next");
        }
      });
    });
  }

  function updateSlide(timelineComponents, timelineTotWidth, string) {
    //retrieve translateX value of timelineComponents['eventsWrapper']
    var translateValue = getTranslateValue(timelineComponents["eventsWrapper"]),
      wrapperWidth = Number(
        timelineComponents["timelineWrapper"].css("width").replace("px", "")
      );
    //translate the timeline to the left('next')/right('prev')
    string == "next"
      ? translateTimeline(
          timelineComponents,
          translateValue - wrapperWidth + eventsMinDistance,
          wrapperWidth - timelineTotWidth
        )
      : translateTimeline(
          timelineComponents,
          translateValue + wrapperWidth - eventsMinDistance
        );
  }

  function showNewContent(timelineComponents, timelineTotWidth, string) {
    //go from one event to the next/previous one
    var visibleContent = timelineComponents["eventsContent"].find(".selected"),
      newContent =
        string == "next" ? visibleContent.next() : visibleContent.prev();

    if (newContent.length > 0) {
      //if there's a next/prev event - show it
      var selectedDate = timelineComponents["eventsWrapper"].find(".selected"),
        newEvent =
          string == "next"
            ? selectedDate.parent("li").next("li").children("a")
            : selectedDate.parent("li").prev("li").children("a");

      updateFilling(
        newEvent,
        timelineComponents["fillingLine"],
        timelineTotWidth
      );
      updateVisibleContent(newEvent, timelineComponents["eventsContent"]);
      newEvent.addClass("selected");
      selectedDate.removeClass("selected");
      updateOlderEvents(newEvent);
      updateTimelinePosition(
        string,
        newEvent,
        timelineComponents,
        timelineTotWidth
      );
    }
  }

  function updateTimelinePosition(
    string,
    event,
    timelineComponents,
    timelineTotWidth
  ) {
    //translate timeline to the left/right according to the position of the selected event
    var eventStyle = window.getComputedStyle(event.get(0), null),
      eventLeft = Number(eventStyle.getPropertyValue("left").replace("px", "")),
      timelineWidth = Number(
        timelineComponents["timelineWrapper"].css("width").replace("px", "")
      ),
      timelineTotWidth = Number(
        timelineComponents["eventsWrapper"].css("width").replace("px", "")
      );
    var timelineTranslate = getTranslateValue(
      timelineComponents["eventsWrapper"]
    );

    if (
      (string == "next" && eventLeft > timelineWidth - timelineTranslate) ||
      (string == "prev" && eventLeft < -timelineTranslate)
    ) {
      translateTimeline(
        timelineComponents,
        -eventLeft + timelineWidth / 2,
        timelineWidth - timelineTotWidth
      );
    }
  }

  function translateTimeline(timelineComponents, value, totWidth) {
    var eventsWrapper = timelineComponents["eventsWrapper"].get(0);
    value = value > 0 ? 0 : value; //only negative translate value
    value =
      !(typeof totWidth === "undefined") && value < totWidth ? totWidth : value; //do not translate more than timeline width
    setTransformValue(eventsWrapper, "translateX", value + "px");
    //update navigation arrows visibility
    value == 0
      ? timelineComponents["timelineNavigation"]
          .find(".prev")
          .addClass("inactive")
      : timelineComponents["timelineNavigation"]
          .find(".prev")
          .removeClass("inactive");
    value == totWidth
      ? timelineComponents["timelineNavigation"]
          .find(".next")
          .addClass("inactive")
      : timelineComponents["timelineNavigation"]
          .find(".next")
          .removeClass("inactive");
  }

  function updateFilling(selectedEvent, filling, totWidth) {
    //change .filling-line length according to the selected event
    var eventStyle = window.getComputedStyle(selectedEvent.get(0), null),
      eventLeft = eventStyle.getPropertyValue("left"),
      eventWidth = eventStyle.getPropertyValue("width");
    eventLeft =
      Number(eventLeft.replace("px", "")) +
      Number(eventWidth.replace("px", "")) / 2;
    var scaleValue = eventLeft / totWidth;
    setTransformValue(filling.get(0), "scaleX", scaleValue);
  }

  function setDatePosition(timelineComponents, min) {
    for (i = 0; i < timelineComponents["timelineDates"].length; i++) {
      var distance = daydiff(
          timelineComponents["timelineDates"][0],
          timelineComponents["timelineDates"][i]
        ),
        distanceNorm =
          Math.round(distance / timelineComponents["eventsMinLapse"]) + 2;
      timelineComponents["timelineEvents"]
        .eq(i)
        .css("left", distanceNorm * min + "px");
    }
  }

  function setTimelineWidth(timelineComponents, width) {
    var timeSpan = daydiff(
        timelineComponents["timelineDates"][0],
        timelineComponents["timelineDates"][
          timelineComponents["timelineDates"].length - 1
        ]
      ),
      timeSpanNorm = timeSpan / timelineComponents["eventsMinLapse"],
      //I can very the end length by changing the number in the following line
      timeSpanNorm = Math.round(timeSpanNorm) + 4,
      totalWidth = timeSpanNorm * width;
    timelineComponents["eventsWrapper"].css("width", totalWidth + "px");
    updateFilling(
      timelineComponents["timelineEvents"].eq(0),
      timelineComponents["fillingLine"],
      totalWidth
    );

    return totalWidth;
  }

  function updateVisibleContent(event, eventsContent) {
    var eventDate = event.data("date"),
      visibleContent = eventsContent.find(".selected"),
      selectedContent = eventsContent.find('[data-date="' + eventDate + '"]'),
      selectedContentHeight = selectedContent.height();

    if (selectedContent.index() > visibleContent.index()) {
      var classEnetering = "selected enter-right",
        classLeaving = "leave-left";
    } else {
      var classEnetering = "selected enter-left",
        classLeaving = "leave-right";
    }

    selectedContent.attr("class", classEnetering);
    visibleContent
      .attr("class", classLeaving)
      .one(
        "webkitAnimationEnd oanimationend msAnimationEnd animationend",
        function () {
          visibleContent.removeClass("leave-right leave-left");
          selectedContent.removeClass("enter-left enter-right");
        }
      );
    eventsContent.css("height", selectedContentHeight + "px");
  }

  function updateOlderEvents(event) {
    event
      .parent("li")
      .prevAll("li")
      .children("a")
      .addClass("older-event")
      .end()
      .end()
      .nextAll("li")
      .children("a")
      .removeClass("older-event");
  }

  function getTranslateValue(timeline) {
    var timelineStyle = window.getComputedStyle(timeline.get(0), null),
      timelineTranslate =
        timelineStyle.getPropertyValue("-webkit-transform") ||
        timelineStyle.getPropertyValue("-moz-transform") ||
        timelineStyle.getPropertyValue("-ms-transform") ||
        timelineStyle.getPropertyValue("-o-transform") ||
        timelineStyle.getPropertyValue("transform");

    if (timelineTranslate.indexOf("(") >= 0) {
      var timelineTranslate = timelineTranslate.split("(")[1];
      timelineTranslate = timelineTranslate.split(")")[0];
      timelineTranslate = timelineTranslate.split(",");
      var translateValue = timelineTranslate[4];
    } else {
      var translateValue = 0;
    }

    return Number(translateValue);
  }

  function setTransformValue(element, property, value) {
    element.style["-webkit-transform"] = property + "(" + value + ")";
    element.style["-moz-transform"] = property + "(" + value + ")";
    element.style["-ms-transform"] = property + "(" + value + ")";
    element.style["-o-transform"] = property + "(" + value + ")";
    element.style["transform"] = property + "(" + value + ")";
  }

  //based on http://stackoverflow.com/questions/542938/how-do-i-get-the-number-of-days-between-two-dates-in-javascript
  function parseDate(events) {
    var dateArrays = [];
    events.each(function () {
      var dateComp = $(this).data("date").split("/"),
        newDate = new Date(dateComp[2], dateComp[1] - 1, dateComp[0]);
      dateArrays.push(newDate);
    });
    return dateArrays;
  }

  function parseDate2(events) {
    var dateArrays = [];
    events.each(function () {
      var singleDate = $(this),
        dateComp = singleDate.data("date").split("T");
      if (dateComp.length > 1) {
        //both DD/MM/YEAR and time are provided
        var dayComp = dateComp[0].split("/"),
          timeComp = dateComp[1].split(":");
      } else if (dateComp[0].indexOf(":") >= 0) {
        //only time is provide
        var dayComp = ["2000", "0", "0"],
          timeComp = dateComp[0].split(":");
      } else {
        //only DD/MM/YEAR
        var dayComp = dateComp[0].split("/"),
          timeComp = ["0", "0"];
      }
      var newDate = new Date(
        dayComp[2],
        dayComp[1] - 1,
        dayComp[0],
        timeComp[0],
        timeComp[1]
      );
      dateArrays.push(newDate);
    });
    return dateArrays;
  }

  function daydiff(first, second) {
    return Math.round(second - first);
  }

  function minLapse(dates) {
    //determine the minimum distance among events
    var dateDistances = [];
    for (i = 1; i < dates.length; i++) {
      var distance = daydiff(dates[i - 1], dates[i]);
      dateDistances.push(distance);
    }
    return Math.min.apply(null, dateDistances);
  }

  /*
		How to tell if a DOM element is visible in the current viewport?
		http://stackoverflow.com/questions/123999/how-to-tell-if-a-dom-element-is-visible-in-the-current-viewport
	*/
  function elementInViewport(el) {
    var top = el.offsetTop;
    var left = el.offsetLeft;
    var width = el.offsetWidth;
    var height = el.offsetHeight;

    while (el.offsetParent) {
      el = el.offsetParent;
      top += el.offsetTop;
      left += el.offsetLeft;
    }

    return (
      top < window.pageYOffset + window.innerHeight &&
      left < window.pageXOffset + window.innerWidth &&
      top + height > window.pageYOffset &&
      left + width > window.pageXOffset
    );
  }

  function checkMQ() {
    //check if mobile or desktop device
    return window
      .getComputedStyle(
        document.querySelector(".cd-horizontal-timeline"),
        "::before"
      )
      .getPropertyValue("content")
      .replace(/'/g, "")
      .replace(/"/g, "");
  }
});

//education session background change
const changeEducationSectionBackground = (ev) => {
  const elem = ev.currentTarget.getAttribute("id");
  document.querySelector(
    "#education"
  ).style.backgroundImage = `url(./image/${elem}.jpg)`;
  if (elem === "medical-background") {
    document.querySelector(
      "#education"
    ).style.backgroundPosition = "10% 15%";
    document.querySelector(
      "#education"
    ).style.backgroundSize = "";
  } else if (elem === "high-school-background") {
    document.querySelector(
      "#education"
    ).style.backgroundPosition = "95% 100%";
    document.querySelector(
      "#education"
    ).style.backgroundSize = "";
  } else if (elem === "bachelor-background") {
    document.querySelector(
      "#education"
    ).style.backgroundPosition = "75% 10%";
    document.querySelector(
      "#education"
    ).style.backgroundSize = "cover";
  } else if (elem === "doctorate-background") {
    document.querySelector(
      "#education"
    ).style.backgroundPosition = "0 -30%";
    document.querySelector(
      "#education"
    ).style.backgroundSize = "cover";
  }
  console.log(elem)
};

//research session click for more info
const moreResearchInfo = (ev) => {
  const elem = ev.currentTarget.getAttribute("id");
  const imgoverlay = ev.currentTarget.getAttribute("class");
  currentIndex = Number(ev.currentTarget.getAttribute("data-index"));
  if (currentIndex === 0) {
    currentIndex = 1;
    document.querySelector(`#${elem}`).innerHTML = "";
    document.querySelector(`#${elem}`).dataIndex = currentIndex;
    document.querySelector('image').setAttribute('class', `${elem}`);
    document.querySelector('image').setAttribute('href', `./image/${elem}.png`);
    console.log(elem, currentIndex);
    if (elem === "astrocyte") {
      document.querySelector(
        '#research-details-h1'
      ).innerHTML = 'Astrocyte';  
      document.querySelector(
        '#research-details-h2'
      ).innerHTML = "From 2003 to 2014, Barres switch his major focus to another type of glial cells called astrocytes, that plays major roles in neural synapsing at the brain regions.";
      document.querySelector(
        '#research-details-footer'
      ).innerHTML = "Click the same area again to go back";
      document.querySelector(
        '#research-details-h1'
      ).style.fontStyle = 'normal';
      document.querySelector(
        '#research-details-h1'
      ).style.fontSize = '280%';
      document.querySelector(
        '#research-details-h1'
      ).style.lineHeight = '200%';
    } else if (elem === "microglia") {
      document.querySelector(
        '#research-details-h1'
      ).innerHTML = 'Microglia';  
      document.querySelector(
        '#research-details-h2'
      ).innerHTML = "In his last 4 research years, microglia, the last type of glial cells in the CNS that serve as macrophages (clearing potential damaging tissues and substances), were widely studied to discover the cause of the nearly absent neural regeneration capability in the CNS, which is possessed by the peripheral nervous system (PNS).";
      document.querySelector(
        '#research-details-footer'
      ).innerHTML = "Click the same area again to go back";
      document.querySelector(
        '#research-details-h1'
      ).style.fontStyle = 'normal';  
      document.querySelector(
        '#research-details-h1'
      ).style.fontSize = '280%';
      document.querySelector(
        '#research-details-h1'
      ).style.lineHeight = '200%';
    } else {
      document.querySelector(
        '#research-details-h1'
      ).innerHTML = 'Oligodendrocyte';  
      document.querySelector(
        '#research-details-h2'
      ).innerHTML = "Barres's first 11 years mainly focus on studying the oligodendrocytes, a type of glial cells, that myelinate the central nervous system (CNS).";
      document.querySelector(
        '#research-details-footer'
      ).innerHTML = "Click the same area again to go back";
      document.querySelector(
        '#research-details-h1'
      ).style.fontStyle = 'normal';  
      document.querySelector(
        '#research-details-h1'
      ).style.fontSize = '280%';
      document.querySelector(
        '#research-details-h1'
      ).style.lineHeight = '200%';
    }
  } else {
    currentIndex = 0;
    document.querySelector(`.${imgoverlay}`).dataIndex = currentIndex;
    document.querySelector(`.${imgoverlay}`).setAttribute('href', "");
    document.querySelector(
      '#research-details-h1'
    ).innerHTML = 'Click the dark grey area on the right for research focus details';  
    document.querySelector(
      '#research-details-h2'
    ).innerHTML = "&nbsp";
    document.querySelector(
      '#research-details-footer'
    ).innerHTML = "&nbsp";
    document.querySelector(
      '#research-details-h1'
    ).style.fontStyle = 'italic';  
    document.querySelector(
      '#research-details-h1'
    ).style.fontSize = '180%';
    document.querySelector(
      '#research-details-h1'
    ).style.lineHeight = '100%';
	  // document.querySelector(`.${imgoverlay}`).href = "";
    const astrocyte = `<path d="M3715 2191 c3 -11 -3 -36 -14 -58 -10 -21 -22 -49 -25 -63 -3 -14 5
-2 19 27 13 29 35 58 49 65 l25 13 -30 17 c-29 17 -30 17 -24 -1z"/>
<path d="M3190 2154 c0 -5 9 -27 19 -47 18 -35 20 -36 26 -16 5 16 0 28 -19
47 -14 15 -26 22 -26 16z"/>
<path d="M3860 2113 c0 -5 17 -16 38 -26 l37 -18 -28 26 c-28 25 -47 32 -47
18z"/>
<path d="M3431 2044 c0 -11 3 -14 6 -6 3 7 2 16 -1 19 -3 4 -6 -2 -5 -13z"/>
<path d="M3332 2037 c9 -8 26 -24 38 -38 l21 -24 -15 31 c-8 17 -23 34 -31 38
-26 10 -31 6 -13 -7z"/>
<path d="M4112 2004 c10 -10 20 -15 24 -12 3 4 -5 12 -18 18 -22 12 -22 12 -6
-6z"/>
<path d="M3446 1977 c3 -10 9 -15 12 -12 3 3 0 11 -7 18 -10 9 -11 8 -5 -6z"/>
<path d="M3962 1955 c-3 -52 -29 -108 -81 -170 -24 -29 -50 -76 -62 -112 -35
-105 -98 -148 -157 -107 -35 24 -55 70 -42 95 6 11 10 47 9 79 -2 37 2 65 11
75 11 13 10 14 -5 9 -16 -7 -17 -3 -12 37 3 24 8 55 11 69 6 22 5 22 -5 -3 -6
-15 -14 -25 -17 -23 -4 2 -4 -33 0 -77 9 -117 9 -147 -1 -147 -5 0 -16 20 -24
44 -8 24 -30 65 -48 92 -19 27 -43 68 -53 92 -10 23 -23 42 -29 42 -5 0 -3
-10 5 -22 8 -13 19 -37 25 -54 l11 -31 -60 14 c-71 16 -181 70 -173 83 3 5 -1
7 -9 4 -8 -3 -24 -1 -35 6 -12 6 -21 9 -21 6 0 -3 30 -22 67 -42 l67 -38 -60
-13 c-32 -8 -86 -16 -120 -20 -42 -3 -61 -9 -61 -19 0 -9 4 -10 11 -5 11 9 60
16 192 27 53 4 87 2 130 -11 52 -15 57 -19 40 -29 -11 -6 -34 -24 -52 -39 -18
-16 -38 -26 -43 -23 -5 3 -8 -2 -7 -11 1 -12 -16 -25 -54 -41 -30 -13 -43 -21
-27 -17 15 3 27 1 27 -5 0 -5 8 -3 18 6 63 56 148 114 168 114 31 0 50 -30 73
-120 10 -41 31 -101 45 -133 30 -66 31 -84 11 -111 -8 -11 -15 -27 -15 -35 -1
-39 -36 -64 -102 -72 -35 -4 -89 -17 -119 -28 -52 -20 -295 -170 -275 -171 6
0 53 24 105 54 157 88 271 121 331 96 38 -16 38 -33 -2 -78 -37 -43 -81 -136
-98 -212 -17 -73 -36 -119 -63 -150 l-22 -25 26 23 c28 25 40 28 35 10 -8 -24
-17 -132 -11 -126 3 3 12 45 21 93 31 179 93 321 163 373 36 26 36 26 16 -21
-21 -51 -18 -59 6 -14 l20 37 26 -17 c20 -13 45 -18 95 -16 64 1 69 0 93 -29
48 -56 24 -169 -50 -243 -23 -22 -27 -28 -10 -12 17 15 34 27 38 27 4 0 7 -24
7 -52 0 -29 4 -59 9 -66 5 -8 6 7 4 35 -4 41 1 62 28 124 28 61 34 85 33 139
-2 100 26 101 72 3 29 -61 46 -74 129 -103 32 -11 70 -28 84 -37 23 -15 25
-15 13 0 -8 9 -41 26 -74 39 -76 29 -138 81 -138 115 0 29 6 29 100 -6 40 -15
77 -20 135 -19 l80 1 -66 8 c-37 5 -80 14 -95 20 l-29 12 30 7 c25 5 21 7 -28
11 -110 10 -166 89 -117 167 23 37 36 39 110 13 87 -31 163 -35 306 -17 191
24 193 25 24 19 -170 -6 -242 3 -317 39 -37 18 -48 28 -48 47 0 19 9 27 51 42
51 19 97 62 213 199 24 28 54 56 65 61 15 7 12 7 -14 3 -42 -8 -69 -24 -75
-46 -9 -26 -152 -157 -181 -164 -41 -10 -52 11 -23 43 44 49 54 69 18 36 -19
-18 -40 -33 -45 -33 -6 0 -23 14 -40 31 -43 45 -81 62 -124 55 -51 -8 -84 16
-76 56 11 54 74 136 121 157 23 10 46 24 50 30 3 7 -8 3 -27 -9 -50 -30 -60
-27 -42 16 9 21 13 55 11 82 -3 47 -3 47 -5 7z m-16 -384 c7 -1 19 -17 29 -37
27 -57 9 -177 -38 -256 -24 -40 -67 -86 -67 -71 0 3 -9 -2 -20 -12 -11 -10
-20 -16 -20 -13 0 4 -19 1 -42 -6 -55 -16 -103 -11 -131 13 -23 18 -46 106
-42 156 6 72 50 141 110 173 51 26 156 59 184 56 14 -1 31 -2 37 -3z"/>
<path d="M3753 1437 c-32 -30 -36 -40 -36 -80 0 -131 182 -157 223 -31 15 46
-8 101 -41 100 -15 -1 -24 5 -24 14 0 18 -20 28 -58 29 -18 1 -40 -11 -64 -32z
m91 17 c33 -13 17 -34 -24 -32 -47 2 -80 -23 -80 -59 0 -14 -4 -21 -10 -18 -6
3 -7 18 -4 33 14 57 71 94 118 76z"/>
<path d="M4220 1928 c0 -21 31 -46 51 -41 18 5 16 8 -13 29 -37 28 -38 28 -38
12z"/>
<path d="M2922 1888 c2 -19 10 -24 47 -26 l44 -3 -30 25 c-39 33 -66 34 -61 4z"/>
<path d="M3038 1733 c-19 -5 -20 -9 -10 -36 6 -15 9 -13 19 13 6 16 11 29 10
29 -1 -1 -10 -3 -19 -6z"/>
<path d="M4577 1709 c-5 -19 -11 -21 -44 -16 l-38 6 40 -14 c22 -7 49 -14 61
-14 11 -1 29 -8 40 -16 43 -32 46 -12 4 30 -24 25 -47 45 -51 45 -4 0 -9 -10
-12 -21z"/>
<path d="M3090 1633 c0 -10 4 -14 8 -8 4 6 11 13 16 18 5 4 2 7 -7 7 -10 0
-17 -8 -17 -17z"/>
<path d="M3010 1107 c0 -31 13 -42 29 -23 8 10 6 17 -9 31 -20 18 -20 17 -20
-8z"/>
<path d="M3581 1054 c0 -11 3 -14 6 -6 3 7 2 16 -1 19 -3 4 -6 -2 -5 -13z"/>
<path d="M3573 945 c0 -27 2 -38 4 -22 2 15 2 37 0 50 -2 12 -4 0 -4 -28z"/>
<path d="M3213 783 c12 -3 16 -10 13 -20 -5 -13 -4 -14 9 -3 8 7 30 16 48 20
26 7 21 8 -28 8 -33 0 -52 -2 -42 -5z"/>
`
    const microglia = `<path
    d="M3781 3434 c0 -11 3 -14 6 -6 3 7 2 16 -1 19 -3 4 -6 -2 -5 -13z"
  />
  <path
    d="M3528 3419 c20 -22 14 -28 -20 -19 -30 9 -31 8 -14 -5 11 -8 24 -15
30 -15 5 0 20 -10 33 -22 l23 -21 -20 41 c-11 22 -26 44 -32 48 -10 6 -11 4 0
-7z"
  />
  <path
    d="M3803 3406 c-13 -6 -23 -15 -23 -21 0 -6 -13 -18 -29 -28 -16 -9 -41
-31 -55 -47 -13 -17 -27 -30 -30 -30 -3 0 -7 19 -7 43 -2 33 -3 36 -6 12 -6
-41 -18 -51 -40 -34 -17 13 -17 13 0 -14 17 -27 17 -28 -5 -37 -22 -8 -22 -9
5 -9 41 -1 32 -34 -13 -46 -23 -5 -56 -61 -98 -167 -2 -4 15 -17 38 -27 23
-10 41 -22 40 -25 -5 -26 15 -9 56 46 27 34 75 89 107 121 l58 57 -60 0 -60 0
14 41 c19 52 46 99 60 100 5 0 25 18 44 40 18 21 32 38 30 38 -2 -1 -14 -6
-26 -13z m-190 -304 c-10 -10 -20 -17 -22 -16 -6 5 20 34 30 34 5 0 1 -8 -8
-18z"
  />
  <path
    d="M3960 3373 c11 -23 20 -50 20 -60 1 -16 2 -16 12 1 8 15 8 21 0 24
-7 2 -12 10 -12 17 0 7 -9 23 -20 36 -20 24 -20 24 0 -18z"
  />
  <path
    d="M3508 3281 c23 -20 29 -30 20 -34 -9 -4 -8 -6 4 -6 32 -2 26 14 -16
42 l-41 28 33 -30z"
  />
  <path
    d="M3895 3271 c5 -34 5 -34 -15 -16 -11 10 -20 13 -20 8 0 -10 49 -48
54 -41 1 2 -3 21 -11 43 -13 38 -13 39 -8 6z"
  />
  <path
    d="M3247 3264 c3 -8 -2 -17 -11 -20 -9 -3 -16 -11 -16 -17 0 -6 11 0 25
13 l25 23 16 -39 c9 -21 25 -51 35 -66 26 -36 24 -51 -3 -43 -22 7 -22 6 -4
-7 12 -9 16 -20 11 -28 -5 -9 -2 -10 14 -5 34 10 26 -22 -11 -46 -26 -16 -28
-19 -9 -14 26 8 24 -1 -13 -45 l-21 -25 26 23 c20 17 28 20 32 10 2 -7 8 1 11
17 12 54 30 80 61 85 28 5 28 6 8 12 -16 4 -23 14 -23 32 0 33 -22 116 -31
116 -3 0 0 -23 7 -52 16 -59 17 -78 7 -78 -10 0 -63 74 -88 124 -19 36 -61 63
-48 30z"
  />
  <path
    d="M3932 3255 c0 -16 2 -22 5 -12 2 9 2 23 0 30 -3 6 -5 -1 -5 -18z"
  />
  <path
    d="M4035 3239 c-11 -17 1 -21 15 -4 8 9 8 15 2 15 -6 0 -14 -5 -17 -11z"
  />
  <path
    d="M4164 3203 l1 -28 -80 2 c-44 1 -82 2 -84 3 -3 0 0 5 7 12 7 7 12 17
12 23 0 5 -4 4 -9 -4 -8 -12 -12 -12 -25 -2 -13 11 -16 11 -16 -3 0 -18 -15
-22 -25 -6 -3 6 -11 10 -17 10 -6 0 -2 -12 7 -27 17 -25 17 -26 -1 -19 -56 23
-77 27 -99 22 -41 -10 -104 -75 -161 -163 -29 -45 -65 -90 -79 -100 -57 -40
-68 -54 -22 -28 27 15 51 24 54 21 4 -3 -1 -25 -10 -48 -13 -35 -14 -39 -2
-24 8 11 15 25 15 31 0 6 5 16 12 23 10 10 15 7 25 -10 11 -21 11 -19 6 16 -6
37 -5 38 16 27 11 -7 21 -19 21 -29 0 -15 2 -15 10 -2 9 13 15 9 41 -20 30
-34 30 -34 10 -3 -27 40 -26 46 2 33 21 -11 21 -10 3 4 -11 9 -30 16 -42 16
-12 0 -31 8 -43 18 -21 16 -19 17 76 17 l98 0 6 -40 c4 -28 7 -33 9 -15 1 14
2 34 1 46 -2 20 45 52 58 39 3 -4 6 -33 6 -65 0 -55 -3 -62 -40 -102 -22 -23
-29 -34 -16 -23 l23 20 -3 -25 c-4 -25 25 -70 45 -70 5 0 0 10 -11 23 -23 24
-22 39 2 112 9 28 19 57 22 65 3 12 9 10 24 -9 10 -13 19 -29 19 -37 0 -8 5
-14 10 -14 6 0 4 13 -5 30 -19 38 -19 50 2 50 15 0 15 1 -2 13 -25 19 -10 39
22 31 18 -5 24 -3 19 5 -5 7 4 11 26 12 30 1 31 2 8 8 -24 7 -24 7 -5 19 43
25 2 10 -51 -19 -62 -33 -90 -27 -49 11 15 14 25 34 25 52 0 20 5 28 18 29 10
0 3 7 -17 15 -19 9 -30 19 -25 24 12 11 116 17 131 7 6 -4 22 -3 35 2 27 11
77 61 59 61 -6 0 -14 -7 -17 -15 -9 -21 -22 -19 -27 5 -3 13 -4 10 -3 -7z"
  />
  <path
    d="M3488 3143 c-22 -26 -30 -43 -21 -43 5 0 17 14 26 30 20 34 18 39 -5
13z"
  />
  <path
    d="M3268 3123 c7 -3 16 -2 19 1 4 3 -2 6 -13 5 -11 0 -14 -3 -6 -6z"
  />
  <path
    d="M4070 3100 c20 -13 33 -13 25 0 -3 6 -14 10 -23 10 -15 0 -15 -2 -2
-10z"
  />
  <path
    d="M3241 3046 c-18 -6 -39 -20 -46 -29 -7 -9 -17 -17 -24 -17 -17 0 -13
-15 8 -34 11 -10 21 -13 25 -7 4 5 2 12 -4 16 -17 11 9 46 46 61 19 8 34 16
34 19 0 3 -1 5 -2 4 -2 0 -18 -6 -37 -13z"
  />
  <path
    d="M3508 2953 c7 -3 16 -2 19 1 4 3 -2 6 -13 5 -11 0 -14 -3 -6 -6z"
  />
  <path
    d="M4104 2912 c19 -22 43 -31 31 -13 -3 5 5 12 17 14 16 3 14 4 -7 4
-17 -1 -37 3 -45 8 -9 5 -7 -1 4 -13z"
  />
  <path
    d="M3726 2867 c3 -10 9 -15 12 -12 3 3 0 11 -7 18 -10 9 -11 8 -5 -6z"
  />
  <path
    d="M3473 2863 c-7 -3 -13 -14 -13 -26 0 -21 0 -21 16 1 17 25 16 32 -3
25z"
  />
  <path
    d="M3695 2817 c3 -10 5 -28 6 -40 0 -12 3 -16 6 -10 3 9 11 9 29 -3 13
-9 24 -12 24 -7 0 5 -11 15 -24 22 -13 8 -29 23 -35 35 -8 14 -10 15 -6 3z"
  />
  <path
    d="M3436 2791 c-16 -18 -16 -19 13 -23 27 -4 29 -3 19 16 -6 12 -12 22
-13 24 -1 1 -9 -6 -19 -17z"
  />
`
    const oligodendrocyte = `<path
    d="M4410 3669 c-48 -28 -60 -47 -60 -89 0 -39 41 -116 112 -208 73 -94
155 -137 188 -97 19 23 33 4 36 -47 2 -24 14 -72 27 -108 23 -62 32 -126 52
-372 9 -103 4 -115 -48 -123 -64 -11 -103 -30 -161 -80 l-53 -45 -144 -10
c-79 -6 -200 -18 -269 -26 -87 -11 -160 -13 -240 -8 l-115 6 23 -24 c33 -36
27 -46 -7 -13 -26 24 -36 27 -72 22 -58 -8 -99 -48 -99 -99 0 -29 -3 -36 -15
-32 -8 4 -15 1 -15 -5 0 -6 5 -11 10 -11 6 0 10 -9 10 -19 0 -30 31 -59 87
-79 39 -15 50 -16 46 -6 -7 18 11 18 47 -1 37 -19 37 -23 0 -36 -16 -6 -30
-15 -30 -20 0 -5 12 -4 26 1 21 8 34 6 61 -10 24 -14 39 -18 47 -11 8 7 22 4
43 -9 27 -16 33 -17 51 -4 11 8 26 31 33 52 7 20 18 47 26 59 8 12 17 46 20
76 7 65 19 74 128 89 39 5 99 14 135 19 216 31 237 25 283 -72 68 -144 278
-278 434 -279 39 0 44 -3 57 -34 14 -33 19 -85 17 -168 -2 -58 -39 -94 -102
-100 -29 -3 -57 -12 -63 -19 -6 -8 -20 -19 -30 -24 -27 -15 -66 -95 -66 -135
0 -29 8 -44 41 -75 23 -22 63 -72 90 -112 27 -39 59 -79 71 -87 30 -22 65 -20
77 3 6 10 23 23 39 29 24 8 32 20 45 69 22 78 21 133 -3 218 -13 45 -24 124
-30 220 -5 83 -12 168 -14 191 -5 36 -2 42 24 57 33 20 65 68 74 112 7 34 -17
138 -40 173 -15 22 -14 26 6 47 16 17 38 25 81 30 50 6 58 9 48 21 -14 17 2
19 18 3 9 -9 33 -7 95 6 46 9 142 20 215 22 151 6 147 2 75 91 -41 51 -89 77
-154 87 -51 8 -148 -10 -148 -27 0 -6 8 -7 18 -3 47 19 52 18 52 -12 0 -44
-27 -62 -149 -98 l-110 -32 -101 14 c-72 10 -113 21 -139 37 -20 13 -60 32
-88 42 -37 13 -55 26 -66 48 -22 43 -42 209 -28 234 13 25 104 71 157 79 52 8
106 37 93 50 -6 6 -4 25 6 52 22 62 12 85 -54 126 -31 19 -87 64 -126 100 -87
80 -117 85 -170 28 -29 -31 -36 -35 -49 -24 -20 17 -20 23 3 47 43 47 36 81
-30 147 -21 21 -59 69 -83 107 -46 70 -78 100 -106 100 -8 0 -31 -9 -50 -21z
m418 -1186 c3 -10 -8 -11 -43 -7 -39 6 -49 3 -70 -16 -14 -13 -25 -19 -25 -12
0 6 12 20 27 32 30 23 103 25 111 3z m50 -11 c2 -7 -2 -10 -12 -6 -9 3 -16 11
-16 16 0 13 23 5 28 -10z"
  />
  <path
    d="M5140 3058 c-28 -31 -50 -82 -50 -120 0 -51 254 -218 333 -218 15 0
36 9 47 20 26 26 40 18 34 -20 -5 -28 -4 -29 24 -24 43 9 135 -13 177 -42 l37
-25 -7 30 c-8 37 5 64 16 35 4 -10 8 -33 8 -49 1 -21 14 -46 44 -79 39 -45 45
-48 75 -41 42 9 52 30 52 113 0 77 -4 83 -65 102 -45 14 -132 58 -185 92 l-35
23 38 -44 c20 -25 37 -48 37 -53 0 -15 -19 -8 -24 10 -4 10 -24 35 -45 56 -50
49 -81 45 -111 -14 -11 -22 -27 -40 -35 -40 -17 0 -18 23 -6 85 9 48 6 52 -75
93 -33 16 -86 50 -120 75 -108 79 -119 82 -164 35z"
  />
  <path
    d="M4046 2217 c-20 -15 -21 -18 -32 -104 -8 -61 0 -75 57 -102 28 -14
36 -15 32 -5 -6 16 -2 17 21 8 19 -7 21 -30 4 -37 -7 -3 -3 -6 8 -6 12 -1 33
-10 47 -21 15 -12 28 -16 32 -10 5 8 85 -35 85 -47 0 -2 -10 -8 -22 -13 -19
-7 -15 -9 23 -9 49 -1 99 27 99 55 0 8 7 26 17 40 15 23 15 28 0 59 -19 41
-113 113 -209 161 -81 41 -135 51 -162 31z"
  />
  <path
    d="M3850 2097 c0 -7 72 -48 76 -44 7 6 -29 34 -53 41 -13 4 -23 5 -23 3z"
  />
  <path
    d="M4481 1991 c-15 -10 -51 -112 -51 -148 0 -16 19 -35 74 -72 47 -32
76 -46 79 -38 3 7 27 -10 58 -40 54 -53 60 -76 14 -55 -14 6 -25 7 -25 2 0
-17 101 -36 124 -23 8 4 30 30 49 56 44 61 39 86 -27 152 -133 132 -247 196
-295 166z"
  />
`
    if (imgoverlay === "astrocyte") {
      const addSvgBack = astrocyte
      document.querySelector(
        `#${imgoverlay}`
      ).innerHTML = `${addSvgBack}`;  
    } else if (imgoverlay === "microglia") {
      const addSvgBack = microglia
      document.querySelector(
        `#${imgoverlay}`
      ).innerHTML = `${addSvgBack}`;
    } else {
      const addSvgBack = oligodendrocyte
      document.querySelector(
        `#${imgoverlay}`
      ).innerHTML = `${addSvgBack}`;  
    }
    console.log(imgoverlay, currentIndex);
  }
};
