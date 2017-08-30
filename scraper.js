//get price,title,url, image url from the product page
//2016-11-21.csv
const scrapeIt = require("scrape-it");
const json2csv = require('json2csv');
const fs = require('fs');
const path = require('path');
const rmdir = require('rmdir');
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
	getPrice_all(shirts);
}).catch((e) =>{
	const msg = "There’s been a 404 error. Cannot connect to the to http://shirts4mike.com.";
	writeToErrorLog(msg);	
});
//create error log
function writeToErrorLog(msg){
	let output = './scraper-error.log';

	if (fs.existsSync(output)){
		fs.unlinkSync(output);
	}
	msg = `${new Date().toString()} ${msg}`;
	fs.writeFile(output, msg, function(err) {
		  if (err) throw err;
		  console.log('The file has been saved!');
	});	
}
// promise all
function getPrice_all(shirts){
	let requests=[]
	shirts.forEach((shirt)=>{
		let url  = 'http://www.shirts4mike.com/shirt.php'.replace('shirt.php',shirt.url);
		let scrape2 = scrapeIt(url,{
			price: ".price",
			title:{
                selector: ".shirt-picture img"
              , attr: "alt" 				
  			}

		});
		requests.push(scrape2);
	});

	Promise.all(requests).then((results) => { 
  		//concatenate price with shirts
  		addToShirts(shirts,results);
	}).catch((e) =>{
			writeToErrorLog(e);	
	});

}
function addToShirts(shirts,results){
	shirts.forEach(shirt =>{
		shirt.url =  `http://www.shirts4mike.com/${shirt.url}`;
		const today = new Date();
		const hours = today.getHours();
		const mins = today.getMinutes();
		const secs = today.getSeconds();
		shirt.time = `${hours}:${mins}:${secs}`;
		shirt.imgUrl =  `http://www.shirts4mike.com/${shirt.imgUrl}`;
		results.forEach(result =>{
			if (shirt.title === result.title){
				shirt.price = result.price
			} 
		})
	})
	writeToCSV(shirts);
}
//export to csv
function writeToCSV(shirts) {
	const today = new Date();
	const date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
	const filename = `${date}.csv`
	const fields = ['url','title','imgUrl','price','time']
	let csv = json2csv({ data: shirts, fields: fields });
	let dir = './data';
	//create the data directory if not exists
	if (!fs.existsSync(dir)){
	    fs.mkdirSync(dir);
	}
	let output = path.join(dir,filename);
	//overwrite the file with the same name
	if (fs.existsSync(output)){
		fs.unlinkSync(output);
	}
	// rmdir(dir, function (err, dirs, files) {
	//   console.log(dirs);
	//   console.log(files);
	//   console.log('all files are removed');
	// });

	fs.writeFile(output, csv, function(err) {
		  if (err) throw err;
		  console.log('file saved');
	});
}
	
