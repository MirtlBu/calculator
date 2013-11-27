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
        alertheader: "#main > header > span:last-child",
        bottomheader: "#productcolumn > section:last-child > header"
    };
    var defaulttext = $(DOMvariables.alertheader).text();
    var directivesForPure = {
        one:{
            "section": {
                "store <- stores":{
                    "header > span":"",
                    "header > p": "store.name",
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
                    "div@class":"'delete'",
                    "input@value": "product.number"
                }
            }
        }
    };
    var productsRender = $(DOMvariables.productcolumn).compile(directivesForPure.one);
    var bowlRender = $(DOMvariables.bowlcolumn).compile(directivesForPure.two);
    //switch headers with store names
    function showList(){
        if($(this).next("ul").hasClass("expanded")){
            $(this).removeClass("unrounded").find("span").removeClass("expanded").closest("header").next("ul").removeClass("expanded");
        }
        else{
            $(this).addClass("unrounded").find("span").addClass("expanded").closest("header").next("ul").addClass("expanded");
        }
    }
    //calculate product calories by multiplied it with amount
    function allBowlCalories(){
        sum = 0;
        for(var i = 0; i < bowlarray.length; i++){
            sum += Math.ceil((bowlarray[i].number * bowlarray[i].cal));
        }
        return sum;
    }
    function identifyElement(_id){
        for(var i = 0; i < bowlarray.length; i++){
            if(bowlarray[i]._id === _id){
               return i;
            }
        }
    }
    //change product amount in bowl
    function changeAmount(){
        $(DOMvariables.alertheader).removeClass("alertalert").text(defaulttext);
        var this_amount = parseInt(($(this).closest("li").find("input").val()), 10);//учить regexp((
        var this_id = $(this).closest("li").attr("data-productid");
        if(isNaN(this_amount)){
            $(DOMvariables.alertheader).addClass("alertalert").text("Похоже, вы ввели значение, которое не является числом.");
        }
        else if(this_amount > 1000){
            $(DOMvariables.alertheader).addClass("alertalert").text("Калькулятор не предназначен для использования в промышленных масштабах. " +
                "Попробуйте уменьшить количество продукта.");
        }
        else{
            bowlarray[identifyElement(this_id)].number = this_amount;
            allBowlCalories();
            //$(DOMvariables.bowlcolumn).render({bowllist: bowlarray}, bowlRender); манда такая, не перерисовывает((
            $(DOMvariables.bowlcolumn).find("header").text("Итог: " + sum + " кал.");
        }
    }
    function deleteProduct(){
        var this_id = $(this).closest("li").attr("data-productid");
        bowlarray.splice(identifyElement(this_id), 1);
        allBowlCalories();
        $(DOMvariables.bowlcolumn).render({bowllist: bowlarray}, bowlRender);
        if(bowlarray.length === 0){
            $(DOMvariables.bowlcolumn).find("ul").removeClass("filled");
        }
        else{
            $(DOMvariables.bowlcolumn).find("ul").addClass("filled");
        }
        $(DOMvariables.bowlcolumn).find("header").text("Итог: " + sum + " кал.");
    }
    //call when click on product in list
    function addProduct(){
        var returnedItem = chooseProduct(this);
        for(var i = 0; i < bowlarray.length; i++){
            if(bowlarray[i]._id === returnedItem._id){
                $(DOMvariables.alertheader).addClass("alertalert").text("Выбранный вами продукт уже есть в миске.");
                return;
            }
        }
        $(DOMvariables.alertheader).removeClass("alertalert").text(defaulttext);
        bowlarray.push(returnedItem);
        $(DOMvariables.bowlcolumn).render({bowllist: bowlarray}, bowlRender);
        $(DOMvariables.bowlcolumn).find("ul").addClass("filled");
        $(DOMvariables.bowlcolumn).find("header").text("Итог: " + sum + " кал.");
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
    function size(){
        alert($(window).width());
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
            $("#main").find("span:last-child").click(size);
             $(DOMvariables.productcolumn).render({stores: jsonArr}, productsRender);
             $(DOMvariables.productcolumn).on("click", "header", showList);
             $(DOMvariables.productcolumn).on("click", ".productlist", addProduct);
             $(document).on("keyup", "input", changeAmount );//почему-то не вешается на DOMvariables.bowlcolumn
             $(document).on("click", ".delete", deleteProduct);
         }
    });

});
