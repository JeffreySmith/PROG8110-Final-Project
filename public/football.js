"use strict";
import 'https://cdnjs.cloudflare.com/ajax/libs/framework7/5.7.10/js/framework7.bundle.js';
import "https://cdnjs.cloudflare.com/ajax/libs/firebase/7.16.0/firebase-app.min.js";
import "https://cdnjs.cloudflare.com/ajax/libs/firebase/7.16.0/firebase-database.min.js";
import "https://cdnjs.cloudflare.com/ajax/libs/firebase/7.16.1/firebase-auth.min.js";
import {app} from "./F7App.js";

const $$ = Dom7;
let documentName = "footballcollection";
export function deleteCardItem(itemName){
    const database = firebase.database();
    const user = firebase.auth().currentUser.uid;
    const ref = database.ref(`${documentName}/${user}`);
    ref.once("value")
    .then(snapshot=>{
        const data = snapshot.val();

        for(const key in data){
            if(data[key].item==itemName){
                const itemRef = ref.child(key);
                itemRef.remove()
                .then(()=>{
                    console.log(`Removed ${itemName} successfully`);
                })
                .catch((error)=>{
                    console.error(`Something went wrong: ${error}`);
                })
            }
        }

    })
    .catch(error => {
        console.error("Error reading data:", error);
      });
}
//This is the function that adds a timestamp to an item. Really, it adds a "datePurchased" attribute to the document
export function addTimeStampReal(itemName){
    const database = firebase.database();
    const user = firebase.auth().currentUser.uid;
    const ref = database.ref(`${documentName}/${user}`);
    ref.once("value")
    .then(snapshot=>{
        const data = snapshot.val();
        console.log(data);
        console.log(itemName);
        for(const key in data){
            console.log(key);
            
            if(data[key].item == itemName){
                console.log("so this isn't running?")
                console.log(data[key].item);
                if(!data[key].hasOwnProperty("datePurchased")){
                    console.log("Doesn't have the prop, but matches")
                }
                data[key].datePurchased = new Date().toISOString().substring(0,10);         
                ref.update(data)
                .then(()=>{
                    console.log("Updated sucessfully");
                })
                .catch(error=>{
                    console.error(`Error updating data ${data} with error: ${error}`);
                })
                break;
            }
        }
    })
    .catch(error => {
        console.error("Error reading data:", error);
      });
}

$$("#tab2").on("tab:show", () => {
    console.log("hello")
    //put in firebase ref here
    const user = firebase.auth().currentUser.uid;
    firebase.database().ref(`${documentName}/` + user).on("value", (snapshot) =>{
        const items = snapshot.val();
        const keys = Object.keys(items);
        //THIS NEEDS TO BE CHANGED TO SOMETHING FITTING THE THEME
        $$("#footballList").html("");
        for(let n = 0; n < keys.length; n++){
            console.log(items[keys[n]])
            let item = items[keys[n]].item;


            //THIS WHOLE SECTION NEEDS TO BE REVISED FOR THE FIELDS WE'RE GOING TO USE
            let datePurchased = items[keys[n]].datePurchased;
            let bought = items[keys[n]].store;
            let image = items[keys[n]].url;
            console.log(item);
            
            //If the item has a defined datePurchased attribute, have a strikethrough, as per the assignment requirements
            let nameOutput = datePurchased ? "<s>"+items[keys[n]].item+"</s>" : items[keys[n]].item;
            
            let dateOutput = datePurchased ? "Purchased on <i>"+items[keys[n]].datePurchased+"</i>" : "";
            
            let imageOutput = image ? `<img style="margin-left:5px" src="${image}" width="80px">` : "";
            let boughtWhere = bought ? "bought at "+bought : "";
            let card = `
            <div class="card">
                <div style="display:flex;align-items:center" class="card-content card-content-padding">
                    <div style="display:flex;align-items:center;justify-content:space-between">
                        <p style="margin:0 5px">${nameOutput}</p>
                        <p style="margin:0 5px">${imageOutput}</p>
                        <p style="margin:0 5px">${dateOutput} ${boughtWhere}</p>
                    </div>
                    <div style="display:flex;margin-left:auto;text-size:12px;width:350px">   
                        <button id="${item.replaceAll(" ","-")}" onclick='addTimeStamp("${item}")' class='button button-active'>I bought this</button>
                        <button style="margin-left:5px;" onclick='deleteItem("${item}")' class='button button-active'>I don't need this</button>
                    </div>
                </div>
            </div>
            `
            $$("#footballList").append(card); //THIS ALSO NEEDS TO BE CHANGED
        }
    });

});

$$(".my-sheet").on("submit", e => {
    //submitting a new note
    e.preventDefault();
    const data = app.form.convertToData("#addItem");
    const user = firebase.auth().currentUser.uid;
    const id = new Date().toISOString().replace(".", "_");
    firebase.database().ref(`${documentName}/` + user + "/" + id).set(data);
    app.sheet.close(".my-sheet", true);
});