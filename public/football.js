"use strict";
import 'https://cdnjs.cloudflare.com/ajax/libs/framework7/5.7.10/js/framework7.bundle.js';
import "https://cdnjs.cloudflare.com/ajax/libs/firebase/7.16.0/firebase-app.min.js";
import "https://cdnjs.cloudflare.com/ajax/libs/firebase/7.16.0/firebase-database.min.js";
import "https://cdnjs.cloudflare.com/ajax/libs/firebase/7.16.1/firebase-auth.min.js";
import {app} from "./F7App.js";

const $$ = Dom7;
//Here's the name of our document. This is used across all of the functions in this file
let documentName = "footballcollection";

export function deleteCardItem(itemUUID){
    const database = firebase.database();
    const user = firebase.auth().currentUser.uid;
    const ref = database.ref(`${documentName}/${user}`);
    ref.once("value")
    .then(snapshot=>{
        const data = snapshot.val();
        //go through all the items, once we match it, remove that item
        for(const key in data){
            if(data[key].uuid==itemUUID){
                const itemRef = ref.child(key);
                itemRef.remove()
                .then(()=>{
                    console.log(`Removed ${itemUUID} successfully`);
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
//It will remove it if it already exists
export function addTimeStampReal(itemUUID){
    const database = firebase.database();
    const user = firebase.auth().currentUser.uid;
    const ref = database.ref(`${documentName}/${user}`);
    ref.once("value")
    .then(snapshot=>{
        const data = snapshot.val();
        
        for(const key in data){   
            if(data[key].uuid == itemUUID){
               
                //If there's already a datePurchased Prop, delete it
                if(data[key].datePurchased){
                    delete data[key].datePurchased;
                }
                //otherwise, create a new one
                else{
                    data[key].datePurchased = new Date().toISOString().substring(0,10);         
                }
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
        //This just means we bail if there are no items for this user. Helps prevent some typeerrors
        if(items == undefined){
            console.log("No items");
            return;
        }
        const keys = Object.keys(items);
        
        let collectionTotal = 0;

        $$("#footballList").html("");
        for(let n = 0; n < keys.length; n++){
            console.log(items[keys[n]])
            let item = items[keys[n]].item;
            //We use it's uuid so we can delete a specific item, not just any that match by the name
            let uuid = items[keys[n]].uuid;
            
            //These are pulled out because for a few of them, we want to add a strikethrough to them depending on the state of the object
            let datePurchased = items[keys[n]].datePurchased;
            let price = items[keys[n]].price;
            let image = items[keys[n]].url;
            let club = items[keys[n]].clubname;
            console.log(item);
            
            //If the user purchased something, include it in their total collection value
            if(datePurchased){
                collectionTotal += parseFloat(price);
            }


            //If the item has a defined datePurchased attribute, have a strikethrough, as per the assignment requirements
            let nameOutput = datePurchased ? "<s>"+"Item: "+items[keys[n]].item+"</s>" : "Item: "+items[keys[n]].item;
            
            //only show this if there's a datePurchased attribute
            let dateOutput = datePurchased ? "Purchased on <i>"+items[keys[n]].datePurchased+"</i>" : "";
            
            //This is where our url gets defined, based on if url is defined for this item
            let imageOutput = image ? `<img style="margin-left:5px;max-width:80px;" src="${image}" width="80px">` : "";
            
            //If we have a price, add a '$' to the beginning of it. If there's a datePurchased, also add a strikethrough to it
            let Price = price ? "$"+price: "";
            Price = datePurchased ? "<s>"+Price+"</s>" : Price;

            //If club is defined, return it. This way we only see the club name if it's defined
            let Club = club ? "Club: "+club : "";
            //Inline styling since there are many things that framework7 likes to override. That was a frustrating discovery 
            //Each card item's buttons have the name of the item as their argument so that we can access that item when we do 
            //things with the database
            let card = `
            <div class="card">
                <div style="display:flex;align-items:center" class="card-content card-content-padding">
                    
                    <div style="display:flex;align-items:center;justify-content:space-between">
                        <p style="margin:0 5px">${nameOutput}</p>
                        <p style="margin:0 5px">${Price}</p>
                        <p style="margin:0 5px">${Club}</p>
                        <p style="margin:0 5px">${imageOutput}</p>
                        <p style="margin:0 5px">${dateOutput}</p>
                    </div>
                    
                    <div style="display:flex;margin-left:auto;text-size:12px;width:350px">   
                        <button id="${item.replaceAll(" ","-")}" onclick='addTimeStampReal("${uuid}")' class='button button-active'>I bought this</button>
                        <button style="margin-left:5px;" onclick='deleteCardItem("${uuid}")' class='button button-active'>I don't need this</button>
                    </div>
                </div>
            </div>
            `
            $$("#footballList").append(card);
        }
        console.log("Total cost: "+collectionTotal);
        //Show the total value of the users website
        if(collectionTotal>0){
            $$("totalCost").val("$"+collectionTotal.toFixed(2));
            document.getElementById("totalCost").innerHTML="Total collection value: $"+collectionTotal.toFixed(2);
        }
        //But if there isn't currently a value, don't show it
        else{
            document.getElementById("totalCost").innerHTML="";
        }
    });
    
});

$$(".my-sheet").on("submit", e => {
    //submitting the merch info in here
    e.preventDefault();
    const data = app.form.convertToData("#addItem");
    const user = firebase.auth().currentUser.uid;
    const id = new Date().toISOString().replace(".", "_");
    //Generate random UUID when the item is created
    const uuid = crypto.randomUUID();
    data.uuid = uuid;
    firebase.database().ref(`${documentName}/` + user + "/" + id).set(data);
    app.sheet.close(".my-sheet", true);
});