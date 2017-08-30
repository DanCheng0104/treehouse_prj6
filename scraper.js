//get price,title,url, image url from the product page
//2016-11-21.csv
const scrapeIt = require("scrape-it");
const json2csv = require('json2csv');
const fs = require('fs');
const path = require('path');
const scrape1 =  scrapeIt("http://www.shirts4mike.com/shirts.php", {
    // Fetch the articles 
    shirts: {
        listItem: ".products li"
      , data: {
            // Get the urls for each shirt
            url: {
                selector: "a"
              , attr: "href"
            },
            // Get title for each shirt
  			title:{
                selector: "img"
              , attr: "alt" 				
  			},
  			//get image urls
  			imgUrl:{
  				selector:'img'
  			  , attr:'src'
  			}       
        }
    }
 

});
scrape1.then((page) =>{
	let shirts = page.shirts;
	getPrice(shirts);
}).catch((e) =>{
  console.log("There’s been a 404 error. Cannot connect to the to http://shirts4mike.com."); // "Uh-oh!"
});

//get shirt price
function getPrice(shirts){
	let i = 0;
	shirts.forEach((shirt,index)=>{
		let url  = 'http://www.shirts4mike.com/shirt.php'.replace('shirt.php',shirt.url);
		let scrape2 = scrapeIt(url,{
			price: ".price"

		});
		scrape2.then((page)=>{
			i+=1;
			shirts[index].price = page.price;
			const today = new Date();
			const hours = today.getHours();
			const mins = today.getMinutes();
			const secs = today.getSeconds();
			shirts[index].url =  `http://www.shirts4mike.com/${shirts[index].url}`;
			shirts[index].time = `${hours}:${mins}:${secs}`;
			shirts[index].imgUrl =  `http://www.shirts4mike.com/${shirts[index].imgUrl}`;
			if (i === 8) {writeToCSV(shirts);}
	
		})
	});

}
//export to csv
function writeToCSV(shirts) {
	const today = new Date();
	const date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
	const filename = `${date}.csv`
	const fields = ['url','title','imgUrl','price','time']
	let csv = json2csv({ data: shirts, fields: fields });
	let dir = './data';

	if (!fs.existsSync(dir)){
	    fs.mkdirSync(dir);
	}
	let output = path.join(dir,filename);

	if (fs.existsSync(output)){
		fs.unlinkSync(output);
	}

	fs.writeFile(output, csv, function(err) {
		  if (err) throw err;
		  console.log('file saved');
	});
}
	
