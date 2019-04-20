$(document).ready( function () {
	//initialize all of the element vars here
	//  so we only have to search for them on a page load
	const mainContent = $('#maincontent');//the main div object
	const infoDiv = $('#building-info');  //referred to as "the infodiv" in comments
	const bldImg = $('#bld-img');         //image of the building in question
	const bldImgImg = $('#bld-img-img');  //
	const imgChange = $('#img-change');   //change the image
	const imgLeft = $('#img-left');       //
	const imgRight = $('#img-right');     //
	const basic = $('#bld-basic');        //the fields in the infodiv
	const floors = $('#bld-floors');      //
	const labType = $('#bld-labtype');    //
	const labAccess = $('#bld-labaccess');//
	const bldCode = $('#bld-code');       //
	const bldDesc = $('#bld-desc');       //
	const verboseName = "";               //
	const closeIcon = $('#close-icon');   //the infodiv close icon
	const showImage = $('#show-image');   //the image view icon
	const infoP = $('#infop');            //contains fields that only apply to buildings
	const searchBar = $('#searchbar');    //search related objects
	const searchBtn = $('#search-btn');	  //
	const searchRes = $('#searchRes');    //
	const permits = {
		//"color": [annual, semester]
		"orange": ["199.81", "110.7"],
		"green": ["170.37", "93.17"],
		"red": ["142.33", "74.72"],
		"gray": ["112.88", "56.27"],
		"blue": ["4", "2"]
	};


	const vals = Object.values( data );

	//determine if the page is on a mobile device (tested w/ iPhone 5 and Pixel 2 XL)
	const smallScreen = window.matchMedia("(min-width: 768px) and (max-width: 992px)").matches;
	
	mainContent.scrollLeft( 600 );
	$(this).scrollTop( 500 );

	let scrLeft = $(this).scrollLeft();
	let scrTop = $(this).scrollTop();

	//hide the infodiv and image at first
	infoDiv.hide();
	bldImg.hide();

	//this is temporary code for identifying map coordinates
	/*
	mainContent.mousemove( function ( event ) {
		$('#title').text( (event.pageX + $(this).scrollLeft() ) + ", " + (event.pageY + $(this).scrollTop()) );
	});
	*/

	//what to do when the map image is clicked
	
	mainContent.click( function ( event ) {
		//Get coords of the click inside the divider, accounting
		//   for the page scroll
		let x = event.pageX + $(this).scrollLeft();
		let y = event.pageY + $(this).scrollTop();

		//Find the nearest coordinates in the list
		//  TODO: coordinate radius needs to be refined
		let b = "";
		try{
			for( let i = 0; i < vals.length - 1; i++ ){
				if( vals[i].hasOwnProperty("coords") ){
					if( Math.abs( vals[i].coords[0] - x ) <= 40 ){
						if( Math.abs( vals[i].coords[1] - y ) <= 40){
							b = vals[i].name.toLowerCase();
							break;
						}
					}
				}
			}
		}catch (TypeError){
			//if the user clicks on a blank area, hide the infodiv and image
			console.log( "nothing here" );
			closeDiv();
			return;
		}

		
		scrLeft = $(this).scrollLeft();
		scrTop = $(this).scrollTop();
		showInfoDiv( b, x, y, scrLeft, scrTop );

	})

	function showInfoDiv( b, x, y, scrLeft, scrTop ){
	//Fill in each field in the infodiv with relevant information
	//  evals are used to translate strings into variable names
	if( b === "" ){
		infoDiv.hide();
		bldImg.hide();
		showImage.attr('class', 'big fitted camera icon');
		return;
	}
	if( b.includes(" ") ){
		let sp = b.indexOf(" ");
		b = b.slice(0, sp) + b.slice(sp+1);
	}
	if( data[b].hasOwnProperty("size") ){
		//this is a parking lot
		let d = data[b]["name"] + " is a " + data[b]["size"] + " sized parking lot located " + data[b]["location"] + " which contains the following spot types:";
		d = d + "<ul>";
		for( let i = 0; i < data[b]["spacetypes"].length; i++ ){
			d = d + "<li>" + data[b]["spacetypes"][i] + "</li>";
		}
		d = d + "</ul>";
		
		if( data[b]["permit"] !== "blue" ){
			d = d + "An " + data[b]["permit"] + " parking permit costs $" + permits[data[b]["permit"]][1] + " per semester, or $" + permits[data[b]["permit"]][0] + " annually.";
		}else{
			d = d + "A blue daily permit costs $" + permits["blue"][0] + " before 5 PM and $" + permits["blue"][1] + " after 5 PM.";
		}
		
		bldCode.text(data[b]["name"]);
		bldDesc.html(d);
		showImage.hide();
		$('#infop').hide();
	}else if( b !== "permits"){
		labType.show();
		labAccess.show();
		const sections = infoP.find('.section');
		let i = 0;
		for( let p in data[b] ){
			if( p !== "coords" && p !== "name" && p !== "description" && p != "verboseName" ){
				let str = p.charAt(0).toUpperCase() + p.slice(1);
				for( let i = 1; i < str.length; i++ ){
					if( str.charCodeAt(i) <= 90 ){
						str = str.slice(0, i) + " " + str.slice(i) + ":";
						break;
					}
				}
				sections[i].innerHTML = str;
				eval(p).html("");
				let empty = true;
				for( let prop in data[b][p] ){
					if( data[b][p][prop] !== "" ){
						empty = false;
						if( !eval(p).html().includes( prop ) ){
							eval(p).html(eval(p).html() + "<li>" + prop.charAt(0).toUpperCase() + prop.slice(1) + ": " + data[b][p][prop] + "</li><br>");
						}
					}
				}
				if( empty ){
					eval(p)[0].previousElementSibling.innerHTML = "";
				}
				i++;
			}else if( p === "name" ){
				bldCode.text(data[b][p]);
			}else if( p === "description" ){
				bldDesc.text(data[b][p]);
			}
			
		}
		if( labType.html().includes("<li>None") ){
			labType.hide();
			labType[0].previousElementSibling.innerHTML = "";
			labAccess.hide();
			labAccess[0].previousElementSibling.innerHTML = "";
		}
	}

	
	//Position and display the infoDiv

	//for this, we need to ignore the scroll distance
	
	x -= scrLeft;
	console.log( "y = " + y + ", srcTop = " + scrTop );
	y -= scrTop;
	console.log( "y - scrTop = " + y );

	if( smallScreen ){
		//on a small screen e.g. mobile phone screen
		//infodiv will be large and centered
		infoDiv.css({
			'width': '80%',
			'left': '10%',
			'right': '10%',
			'top': '10%'
		})
		infoDiv.show();
	}else{
		//Offset the infoDiv so that it doesn't go off the screen
		if( (x + infoDiv.width()) >= $(window).width() ){
			x -= infoDiv.width();
		}

		if( (y + infoDiv.height()) >= $(window).height() ){
			y -= infoDiv.height();
		}

		//Set the position of the info div to the new coords
		console.log( "displaying infoDiv for " + b + " at (" + x + ", " + y + ")" );
		infoDiv.css({
			'left': x,
			'top': y
		})

		//Display the infoDiv
		infoDiv.show();
	}
}


	//Show/hide the info div using the close button
	closeIcon.click( function (){
		closeDiv();		
	})
	closeIcon.hover(
		function () {
			$(this).css({
				'color': 'red'
			})
		},
		function () {
			$(this).css({
				'color': 'black'
			})
		}
	)

	//Show/hide images
	showImage.hover(
		function(){
			$(this).css({
				'color': 'blue'
			})
		},
		function(){
			$(this).css({
				'color': 'initial'
			})
		}
	)

	let imgSrc = "";

	//Display the image next to the infodiv
	//  Note: the constant 1.333 is the width/height ratio of the original images
	showImage.click( function () {
		$(this).attr( 'class', 'big fitted disabled camera icon' );


		bldImgImg.prop( 'src', 'images/' + bldCode.text().toLowerCase() + '/1.jpg');
				
		imgSrc = bldImgImg[0].getAttribute( 'src' );

		if( bldImg.attr('style').includes( 'display: none' )){
			let h = 0;
			let w = 0;
			if( smallScreen ){
				//on a small screen, make the infodiv appear in the
				// center of the screen and make the image appear on top of it
				w = infoDiv.width();
				h = Math.ceil( w * (1/1.333) );
				
				bldImg.css({
					'top': infoDiv.position().top + 50,
					'left': '10%',
					'margin-left': '15px'
				})
			}else{
				//width and height are variable depending on the height of the infodiv
				h = infoDiv.height();
				w = Math.ceil( h * 1.333 );
				
				//determine the position of the image relative to the infodiv
				if( infoDiv.position().left + infoDiv.width() + w > $(window).width() ){
					infoDiv.css({
						'left': infoDiv.position().left - ( (infoDiv.position().left + infoDiv.width() + w) - $(window).width() ) - 10
					})
				}
				bldImg.css({
					'top': infoDiv.position().top,
					'left': infoDiv.position().left + infoDiv.width()
				})
			}
			//set the image dimensions
			bldImgImg.prop('width', w );
			bldImgImg.prop('height', h );


			//position the next and prev image buttons
			imgChange.css({
				'top': bldImg.position().top + (0.5 * bldImg.height()),
				'left': bldImg.position().left + 33

			})
			bldImg.show();
		}else{
			$(this).attr( 'class', 'big fitted camera icon' );
			bldImg.hide();
		}
	})

	//make the image change when a button is pressed
	//  images must be named like "1.jpg"
	imgRight.click( function () {
		let src = bldImgImg[0].getAttribute('src');
		let imgPath = "";
		ns = 0;
		for( let i = 0; i < src.length; i++ ){
			if( ns === 2 ){
				break;
			}else if( src[i] === '/' ){
				ns++;
			}
			imgPath += src[i];
		}
		let num = parseInt(src.slice( imgPath.length, src.indexOf('.') ));
		num++;
		bldImgImg.on( "error", function () {
			num--;
			bldImgImg[0].setAttribute('src', imgPath + num + ".jpg");
		})
		bldImgImg[0].setAttribute('src', imgPath + num + ".jpg");
	})

	imgLeft.click( function () {
		let src = bldImgImg[0].getAttribute('src');
		let imgPath = "";
		ns = 0;
		for( let i = 0; i < src.length; i++ ){
			if( ns === 2 ){
				break;
			}else if( src[i] === '/' ){
				ns++;
			}
			imgPath += src[i];
		}
		let num = parseInt(src.slice( imgPath.length, src.indexOf('.') ));
		num--;
		bldImgImg.on( "error", function () {
			num++;
			bldImgImg[0].setAttribute('src', imgPath + num + ".jpg");
		})

		bldImgImg[0].setAttribute('src', imgPath + num + ".jpg");
	})

	function closeDiv (){
		//close the information div
		infoP.show();
		showImage.show();
		infoDiv.hide();
		bldImg.hide();
		showImage.attr('class', 'big fitted camera icon');
		labType.show();
	}

	//run the search when the button is clicked or the enter key is pressed
	searchBtn.click(function () {
		search();
	})
	searchBar.on( "keyup", function (){
		if( event.key === "Enter" ){
			search();
		}
	})

	searchBar.on( "focus", function (){
		//hide the search results if the search bar gains focus again
		searchBar.val("");
		searchRes.hide();
	})

	function search (){
		//find every structure that contains our search query in its short or verbose name
		//search query must be at least 3 characters
		searchRes.html("<b>Search results:</b><br>");
		if( searchBar.val().length < 3 ){
			return;
		}else{
			let qr = searchBar.val().toLowerCase();
			let gotResults = false;
			for( let e in data ){
				if( data[e].name.toLowerCase().includes( qr ) || ( data[e].hasOwnProperty("verboseName") && data[e].verboseName.toLowerCase().includes( qr ))){
					gotResults = true;
					let vn = "";
					if( data[e].hasOwnProperty( "verboseName" ) ){
						vn = data[e].verboseName;
					}else if( data[e].hasOwnProperty("size") ){
						vn = "Parking lot";
					}
					searchRes.html( searchRes.html() + "<li>" + data[e].name + "\n<br><i>" + vn + "</i></li><hr>");
				}
			}
			if( !gotResults ){
				searchRes.html( searchRes.html() + "<li>No results.</li>" );
			}

			if( smallScreen ){
				searchRes.css({
					'width': '50%',
					'left': '25%',
					'top': '10%'
				})
			}
			searchRes.show();
			
			searchRes.find("li").each( function( index ){
				//when an individual search result is clicked
				$(this).click( function (){
					let tmp = $(this).text().slice(0, $(this).text().indexOf("\n"));
					if( tmp.includes(" ") ){
						tmp = tmp.slice(0, tmp.indexOf(" ") ) + tmp.slice(tmp.indexOf(" ") + 1 );
					}
					showInfoDiv( tmp.toLowerCase(), data[tmp.toLowerCase()].coords[0], data[tmp.toLowerCase()].coords[1], mainContent.scrollLeft(), mainContent.scrollTop());
					if( smallScreen ){
						searchRes.hide();
					}
				})
			})
		}
	}

	

})