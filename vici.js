//CORE COMPONENTS

function createOptionsForCards(coreId){
    const mainDetail = document.createElement("details");
    const summaryElement = document.createElement('summary');
    summaryElement.appendChild(document.createTextNode("Options"));
    mainDetail.appendChild(summaryElement);
    const moveId = coreId;
    const saveId = coreId;
    const killId = coreId;
    const pullId = coreId;
    const pushId = coreId;
    const moreId = coreId;
    const lessId = coreId;
    const moveButton = document.createElement("button");
    moveButton.appendChild(document.createTextNode("Move"));
    moveButton.name = moveId;
    moveButton.setAttribute("onclick", "moveRecord(this.name)");
    mainDetail.appendChild(moveButton);
    const saveButton = document.createElement("button");
    saveButton.appendChild(document.createTextNode("Sync"));
    saveButton.name = saveId;
    saveButton.setAttribute("onclick", "saveRecord(this.name)");
    mainDetail.appendChild(saveButton);
    const killButton = document.createElement("button");
    killButton.appendChild(document.createTextNode("Delete"));
    killButton.name = killId;
    killButton.setAttribute("onclick", "killRecord(this.name)");
    mainDetail.appendChild(killButton);
    const pullButton = document.createElement("button");
    pullButton.appendChild(document.createTextNode("Front"));
    pullButton.name = pullId;
    pullButton.setAttribute("onclick", "pullRecord(this.name)");
    mainDetail.appendChild(pullButton);
    const pushButton = document.createElement("button");
    pushButton.appendChild(document.createTextNode("Back"));
    pushButton.name = pushId;
    pushButton.setAttribute("onclick", "pushRecord(this.name)");
    mainDetail.appendChild(pushButton);
    const moreButton = document.createElement("button");
    moreButton.appendChild(document.createTextNode("Grow"));
    moreButton.name = moreId;
    moreButton.setAttribute("onclick", "moreRecord(this.name)");
    mainDetail.appendChild(moreButton);
    const lessButton = document.createElement("button");
    lessButton.appendChild(document.createTextNode("Shrink"));
    lessButton.name = lessId;
    lessButton.setAttribute("onclick", "lessRecord(this.name)");
    mainDetail.appendChild(lessButton);
    return mainDetail;
}

function coreFormBasics(){
    const neededArticle = document.createElement("article");
    neededArticle.style = "left:10rem;top:10rem;z-index:1;";
    const articleForm = document.createElement("form");
    articleForm.style = "width:10rem;height:fit-content;";
    const articleFormInput1 = document.createElement("input");
    articleFormInput1.type = "text";
    articleFormInput1.name = "head";
    articleFormInput1.value = "head";
    const articleFormInput2 = document.createElement("input");
    articleFormInput2.type = "text";
    articleFormInput2.name = "body";
    articleFormInput2.value = "body";
    const articleFormInput3 = document.createElement("input");
    articleFormInput3.type = "text";
    articleFormInput3.name = "tail";
    articleFormInput3.value = "tail";
    articleForm.appendChild(articleFormInput1);
    articleForm.appendChild(articleFormInput2);
    articleForm.appendChild(articleFormInput3);
    neededArticle.appendChild(articleForm);
    return neededArticle;
}

//REGISTERS

var registeredComponents={
    "form-core":{"counter": 1,"component": coreFormBasics()}
};
var heightValue =  null;
var widthValue =  null;

//EVENTS

/**
 * This allows us to confirm the fields we wanted in a given form
 * @param {*} event 
 */
function createNewForm(event){
    console.log("createNewForm");
    console.log(event);
    //get me the element
    var targetSection = document.getElementById("platform-content");
    //get the parent element from the registry 
    if(event in registeredComponents){
        countOfElement = registeredComponents[event]["counter"] +1;
        registeredComponents[event]["counter"] = countOfElement;
        const generatedId = event+"-"+countOfElement;
        const neededElement = registeredComponents[event]["component"].cloneNode(true);
        neededElement.id = generatedId;
        neededElement.appendChild(createOptionsForCards(generatedId));
        targetSection.appendChild(neededElement);
    }
    else {
        alert("Unknown form add attempted!");
    }
}

/**
 * This is the on submit function when adding fields
 * @param {*} event 
 */
function addFormField(event){
    console.log("addFormField");
    console.log(event);
    const inputField = document.createElement("input");
    //the related fields
    const typeInput = document.getElementById("formType");
    const nameInput = document.getElementById("formName");
    const attrInput = document.getElementById("formAttributes");
    const classInput = document.getElementById("formClass");
    inputField.setAttribute("type", typeInput.value);
    inputField.setAttribute("name", nameInput.value);
    inputField.setAttribute("class", classInput.value);
    if(attrInput.value!=""){
        alert("This is a future functionality, we can't cover new types of fields with attr, please reset");
    } else {
        const bufferTarget = document.getElementById("formCreationBuffer");
        bufferTarget.appendChild(inputField);
    }
}
/**
 * this is the function to clear the added fields
 * @param {*} event 
 */
function clearFormField(event){
    console.log("clearFormField");
    console.log(event);
    document.getElementById("formCreationBuffer").remove();
    const newFormBuffer = document.createElement('form');
    newFormBuffer.id = "formCreationBuffer";
    const menuFound = document.getElementById("formCreationMenu");
    menuFound.appendChild(newFormBuffer);
}
/**
 * This saves the given form for use in the main display
 * @param {*} event 
 */
function addNewForm(event){
    console.log("addNewForm");
    console.log(event);
    const menuFound = document.getElementById("formCreationBuffer");
    if(menuFound.children.length>0){
        const formClone = menuFound.cloneNode(true);
        const neededArticle = document.createElement("article");
        neededArticle.style = "left:10rem;top:10rem;z-index:1;";
        formClone.style = "width:10rem;height:fit-content;";
        neededArticle.appendChild(formClone);
        const formOptionName = document.getElementById("formDisplayName").value;
        if(formOptionName==""){
            alert("Please add name before saving!");
        } else {
            registeredComponents[formOptionName] = {"counter": 1,"component": neededArticle};
            clearFormField(event);
            //create my button
            const selectionMenu = document.getElementById("formSelectionMenu");
            const addButton = document.createElement("button");
            addButton.id=formOptionName;
            addButton.appendChild(document.createTextNode("Add "+formOptionName));
            addButton.setAttribute("onclick", "createNewForm(this.id)");
            selectionMenu.appendChild(addButton);
        }

    }else {
        alert("Please add child nodes before aving!");
    }
}
/**
 * Function to activate move mode, clicking resets the setting
 * @param {*} event 
 */
function moveRecord(event){
    console.log("moveRecord");
    console.log(event);
    const elementTarget = document.getElementById(event);
    if(elementTarget.classList.contains("moving")){
        elementTarget.classList.remove("moving");
    } else {
        elementTarget.classList.add("moving");
    }
    dragElement(elementTarget);
}

function dragElement(elmnt) {
    console.log(elmnt);
    var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
    if(elmnt.classList.contains("moving")){
        if (document.getElementById(elmnt.id)) {
        // if present, the header is where you move the DIV from:
        document.getElementById(elmnt.id).onmousedown = dragMouseDown;
        } else {
        // otherwise, move the DIV from anywhere inside the DIV:
        elmnt.onmousedown = dragMouseDown;
        }
    } else {
        closeDragElement();
        elmnt.onmousedown=null;
    }
  
    function dragMouseDown(e) {
      console.log(e);
      e = e || window.event;
      e.preventDefault();
      document.onmouseup = closeDragElement;
      // call a function whenever the cursor moves:
      document.onmousemove = elementDrag;
    }
  
    function elementDrag(e) {
        console.log(e);
      e = e || window.event;
      e.preventDefault();
      // set the element's new position:
      elmnt.style.top = (e.clientY-(elmnt.clientHeight))+"px";
      elmnt.style.left = (e.clientX-(elmnt.clientWidth))+"px";
    }
  
    function closeDragElement() {
      document.onmouseup = null;
      document.onmousemove = null;
    }
  }



/**
 * Function to resize the record
 * @param {*} event 
 */
function saveRecord(event){
    console.log("sizeRecord");
    console.log(event);
    console.log(document.getElementById(event).children[0].children);
    alert("Syncing records has not yet been implemented");
}


/**
 * Function to delete the record
 * @param {*} event 
 */
function killRecord(event){
    console.log("killRecord");
    console.log(event);
    document.getElementById(event).remove();
}
/**
 * Function to bring the record forward
 * @param {*} event 
 */
function pullRecord(event){
    console.log("pullRecord");
    console.log(event);
    document.getElementById(event).style.zIndex++;
}
/**
 * Function to bring the record back
 * @param {*} event 
 */
function pushRecord(event){
    console.log("pushRecord");
    console.log(event);
    document.getElementById(event).style.zIndex--;
}
/**
 * Function to bring the record forward
 * @param {*} event 
 */
function moreRecord(event){
    console.log("pullRecord");
    console.log(event);
    let widthValue= parseInt(document.getElementById(event).children[0].style.width);
    document.getElementById(event).children[0].style.width = (widthValue+1)+"rem";
}
/**
 * Function to bring the record back
 * @param {*} event 
 */
function lessRecord(event){
    console.log("pullRecord");
    console.log(event);
    let widthValue= parseInt(document.getElementById(event).children[0].style.width);
    document.getElementById(event).children[0].style.width = (widthValue-1)+"rem";
}
/**
 * On change operation for the given fields
 * @param {*} event 
 */
function fieldChanges(event){
    console.log("fieldChanges");
    console.log(event);
}