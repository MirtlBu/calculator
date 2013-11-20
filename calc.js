/**
 * Created with JetBrains PhpStorm.
 * User: Mirtl
 * Date: 03.11.13
 * Time: 14:48
 * To change this template use File | Settings | File Templates.
 */

$(document).ready(function(){
    var jsonArr = [];
    var bowlarray = [];
    var sum = 0;
    var DOMvariables = {
        productcolumn: "#productcolumn",
        bowlcolumn: "#bowlcolumn",
        alertheader: "main > header > span:last-child",
        bottomheader: "#productcolumn > section:last-child > header"
    };
    var defaulttext = $(DOMvariables.alertheader).text();
    var directivesForPure = {
        one:{
            "section": {
                "store <- stores":{
                    "header": "store.name",
                    "header@class":"'storeheader'",
                    "@data-store":"store._id",
                    "li":{
                        "product <- store.items":{
                            ".": "product.name",
                            "@class": "'productlist'",
                            "@data-productid":"product._id"
                        }
                    }
                }
            }
        },
        two:{
            "span":"sum",//что блин не так?(
            "li":{
                "product <- bowllist":{
                    "@class":"'inbowl'",
                    "@data-productid": "product._id",
                    "p:first-child": "product.name",
                    "p:nth-child(3)":"product.measure",
                    "p:nth-child(4)": "'V'",
                    "p:nth-child(4)@class": "'add'",
                    "p:last-child":"'X'",
                    "p:last-child@class":"'delete'",
                    "input@value": "product.number"
                }
            }
        }
    };
    var productsRender = $(DOMvariables.productcolumn).compile(directivesForPure.one);
    var bowlRender = $(DOMvariables.bowlcolumn).compile(directivesForPure.two);
    //switch headers with store names
    function showList(){
        $(DOMvariables.productcolumn).find("header").removeClass("unrounded").next("ul").removeClass("expanded");
        $(this).addClass("unrounded").next("ul").addClass("expanded");
    }
    //calculate product calories by multiplied it with amount
    function calcSumOfBowl(e,_id, amount){
        sum = 0;
        for(var i = 0; i < bowlarray.length; i++){
            if(bowlarray[i]._id === _id){
                if(e === "delete"){
                    bowlarray.splice(i, 1);
                }
                else if(e === "change"){
                    bowlarray[i].number = amount;
                }
            }
            sum += Math.ceil(bowlarray[i].number * bowlarray[i].cal);
        }
        return sum;
    }
    //change product amount in bowl
    function changeAmount(){
        $(DOMvariables.alertheader).text(defaulttext);
        var this_amount = parseInt(($(this).closest("li").find("input").val()), 10);//учить regexp((
        var this_id = $(this).closest("li").attr("data-productid");
        if(isNaN(this_amount) || this_amount > 1000){
            $(DOMvariables.alertheader).text("Введите верное количество продукта.");
        }
        else{
            calcSumOfBowl("change", this_id, this_amount);
            //$(DOMvariables.bowlcolumn).render({bowllist: bowlarray}, bowlRender); манда такая, не перерисовывает((
            $("#bowlcolumn").find("header").text("Итог: " + sum + " кал.");
        }
    }
    function deleteProduct(){
        calcSumOfBowl("delete", $(this).closest("li").attr("data-productid"));
        $(DOMvariables.bowlcolumn).render({bowllist: bowlarray}, bowlRender);
        $("#bowlcolumn").find("header").text("Итог: " + sum + " кал.");
    }
    //call when click on product in list
    function addProduct(){
        var returnedItem = chooseProduct(this);
        for(var i = 0; i < bowlarray.length; i++){
            if(bowlarray[i]._id === returnedItem._id){
                $(DOMvariables.alertheader).text("Выбранный вами продукт уже есть в миске.");
                return;
            }
        }
        $(DOMvariables.alertheader).text(defaulttext);
        bowlarray.push(returnedItem);
        $(DOMvariables.bowlcolumn).render({bowllist: bowlarray}, bowlRender);
        $("#bowlcolumn").find("header").text("Итог: " + sum + " кал.");
    }
    //get store and id of chosen element from data attribute and call search function
    function chooseProduct(el){
        return searchProduct($(el).closest("section").data("store"), $(el).data("productid"));
    }
    //search object with the same store id and then item id and push it to bowl array
    function searchProduct(itemstore, itemid){
        for(var i = 0; i < jsonArr.length; i++){
            if(jsonArr[i]._id === itemstore){
                for(var j = 0; j < jsonArr[i].items.length; j++){
                    if(jsonArr[i].items[j]._id === itemid){
                        jsonArr[i].items[j].number = 0;
                        return jsonArr[i].items[j];
                    }
                }
            }
        }
    }
    //get data from json
    $.ajax({
         url: "newjson.json",
         dataType: "json",
         success: function(data){
             $.each(data, function(key, val){
                 jsonArr.push(val);
             });
         },
         error: function(jqXHR, textStatus, errorThrown) {
             alert(textStatus + ": " + errorThrown);
         },
         complete: function(){
             $(DOMvariables.productcolumn).render({stores: jsonArr}, productsRender);
             $(DOMvariables.productcolumn).on("click", "header", showList);
             $(DOMvariables.productcolumn).on("click", ".productlist", addProduct);
             $(document).on("change", "input", changeAmount );//почему-то не вешается на DOMvariables.bowlcolumn
             $(document).on("click", ".add", changeAmount );
             $(document).on("click", ".delete", deleteProduct);
         }
    });

});
