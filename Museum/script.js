/// <reference path="https://ajax.googleapis.com/ajax/libs/angularjs/1.6.9/angular.min.js" />
var myModule=angular.module("myModule",['LocalStorageModule']);
myModule.config(function (localStorageServiceProvider) {
	localStorageServiceProvider.setPrefix('museum');
	// localStorageServiceProvider.setStorageCookie(45, '/museum', false);  
	localStorageServiceProvider.setStorageType('sessionStorage');


});
////////////////////////////////////////////////image upload demo
myModule.directive('fileModel', ['$parse', function ($parse) {
	return {
	   restrict: 'A',
	   link: function(scope, element, attrs) {
		  var model = $parse(attrs.fileModel);
		  var modelSetter = model.assign;
		  
		  element.bind('change', function(){
			 scope.$apply(function(){
				modelSetter(scope, element[0].files[0]);
			 });
		  });
	   }
	};
 }]);

 myModule.service('fileUpload', ['$http', function ($http) {
	// this.uploadFileToUrl = function(file){
	//    var fd = new FormData();
	//    fd.append('file', file);
	//    this.path = "";
	
	//    $http.post('http://localhost:3000/museum/image', fd, {
	// 	transformRequest: angular.identity,
	// 	headers: {'Content-Type': undefined}
	//  })
	//    .then(function(response){
	// 	   console.log("Success");
	// 	   this.path = response.data.path;
	// 	//    console.log(path);
		   
	//    })
	//    .catch(function(error){
	// 	console.log(error.data);
	//    });

	// }
 }]);

/////////////////////////////////////////////////image upload demo

myModule.controller("dashboard",['$scope','fileUpload','$http','localStorageService',function($scope,fileUpload,$http,localStorageService){
	$scope.ourLogo = "D:/Museum Aggregators/logo.jpg";
$scope.images;
var cnt=0;
$scope.logout = function(){ 
			localStorageService.remove("usrId");
			window.open("index.html","_self");
	
}

$scope.saveHistory = function(){
	$http.patch('http://localhost:3000/museum/saveHistory/'+localStorageService.get("usrId"),{"history":$scope.history})
	.then()
	.catch(function(error){
		alert("Error");
	});
}

$scope.saveDescription = function(){
	$http.patch('http://localhost:3000/museum/saveDescription/'+localStorageService.get("usrId"),{"description":$scope.description})
	.then(function(){
		alert("Description Saved");
		
	})
	.catch(function(error){
		alert("Error");
	});
}
//////////////Manish
$scope.addImage=function(){
	var file = $scope.myFile;
	var fd = new FormData();
	fd.append('file', file);
	console.log("FUnction Called");
	$scope.uploadFile(fd);
	$http.patch('http://localhost:3000/museum/addImage/'+localStorageService.get("usrId"),{"path":file.name,"desc":$scope.imageDesc})
		.then(function(response){
			if(response.status == 200){
				alert("Image Added");
			}
		});
		$scope.getUserData();
}




///////////////Manish


$scope.getUserData = function(){
	$http.get('http://localhost:3000/museum/getuserData/'+localStorageService.get("usrId"),{})
	.then(function(response){
		console.log(response.data);
		console.log(response.data.data.logo)
		$scope.museumLogo=response.data.data.logo;
		$scope.mname = response.data.data.mname;
		$scope.address = ""+response.data.data.address + " , " +response.data.data.pincode + " , "+response.data.data.city;
		$scope.images = response.data.data.images;
		$scope.description =response.data.data.description;
		$scope.history = response.data.data.history;
		$scope.currentImage =$scope.images[cnt].path;
	$scope.currentDesc = $scope.images[cnt].desc;
	cnt++;
	})
	.catch(function(error){
		console.log(error.data);
	});
	
}
$scope.uploadFile = function(fd){
	$http.post('http://localhost:3000/museum/image', fd, {
	 transformRequest: angular.identity,
	 headers: {'Content-Type': undefined}
  })
	.then(function(response){
	
		logoPath= response.data.path;
		console.log(logoPath);
	})
	.catch(function(error){
	 console.log(error.data);
	});


 };

 $scope.changeImage = function()
{
	console.log($scope.images);
	if(cnt >= $scope.images){
		cnt = 0
	}
	else{
		cnt++;
	}
	$scope.currentImage =$scope.images[cnt].path;
	$scope.currentDesc = $scope.images[cnt].desc;
}
$scope.changeImageNext = function()
{
	if(cnt >= $scope.images.length - 1){
		cnt = 0
	}
	else{
		cnt++;
	}
	
	$scope.currentImage =$scope.images[cnt].path;
	$scope.currentDesc = $scope.images[cnt].desc;
}

$scope.changeImagePrev = function()
{
	console.log($scope.images + " Object" );
	if(cnt <= 0){
		cnt = $scope.images.length - 1;
	}
	else{
		cnt--;
	}
	$scope.currentImage =$scope.images[cnt].path;
	$scope.currentDesc = $scope.images[cnt].desc;
}

$scope.deleteImage = function(){
  console.log("old"+$scope.images);
	$scope.images.splice(cnt, 1);
console.log($scope.images);

  $http.patch('http://localhost:3000/museum/deleteImage/'+localStorageService.get("usrId"),{
	  "images":$scope.images
  })
  .then(function(response){
	  alert("Image Removed");
  })
  .catch(function(error){
	  console.log(error);
	  alert("Error");
  });

  $scope.getUserData();
  $scope.changeImageNext();
}



}]);

myModule.controller("indexController",['$scope','$http','localStorageService',function($scope,$http,localStorageService){
	
$scope.latitude;
$scope.longitude;
$scope.data="";
$scope.museumID;
$scope.userId;
$scope.geocoder = new google.maps.Geocoder();
$scope.map;
$scope.myProp;
$scope.ourLogo = "D:/Museum Aggregators/logo.jpg";
$scope.images="";
var cnt=0;
$scope.museumDetails = function(){
	$http.get(
		'http://localhost:3000/museum/getInfo/'+localStorageService.get("museumId"),
		{}
	)
	.then(function(response){
	
		if(response.status == 200 )
		{
			 alert ("Got Data");
			 $scope.address = ""+response.data.address +" ,\n "+response.data.pincode +" ,\n"+response.data.city;
			 $scope.museumName = ""+response.data.mname;
			 $scope.museumLogo = response.data.logo;
			 $scope.history = response.data.history;
			 $scope.email = response.data.email;
			 $scope.cno = response.data.cno;
			 $scope.description = response.data.description;
			 $scope.facebook = response.data.facebook ; 
			 $scope.insta = response.data.insta ;
			 $scope.youtube = response.data.youtube ;
			 $scope.twitter = response.data.twitter ;
			 $scope.website = response.data.website ;
			$scope.images = response.data.images ;
			 if(response.data.timming.mon.isOpen =="true" ){
				 
				 $scope.monTime = ""+response.data.timming.mon.from +" To "+ response.data.timming.mon.to;
			 }
			 else{
				 $scope.monTime = "Close";
			 }

			 if(response.data.timming.tue.isOpen  =="true" ){
				$scope.tueTime = ""+response.data.timming.tue.from +" To "+ response.data.timming.tue.to;
			}
			else{
				$scope.tueTime = "Close";
			}

			if(response.data.timming.wed.isOpen =="true" ){
				
				$scope.wedTime = ""+response.data.timming.wed.from +" To "+ response.data.timming.wed.to;
			}
			else{
				$scope.wedTime = "Close";
			}

			if(response.data.timming.thu.isOpen  =="true" ){

				$scope.thuTime = ""+response.data.timming.thu.from +" To "+ response.data.timming.thu.to;
			}
			else{
				$scope.thuTime = "Close";
			}

			if(response.data.timming.fri.isOpen  =="true" ){
				$scope.friTime = ""+response.data.timming.fri.from +" To "+ response.data.timming.fri.to;
			}
			else{
				$scope.friTime = "Close";
			}

			if(response.data.timming.sat.isOpen  == "true" ){
				$scope.satTime = ""+response.data.timming.sat.from +" To "+ response.data.timming.sat.to;
			}
			else{
				$scope.satTime = "Close";
			}

			if(response.data.timming.sun.isOpen  == "true" ){
				$scope.sunTime = ""+response.data.timming.sun.from +" To "+ response.data.timming.sun.to;
			}
			else{
				$scope.sunTime = "Close";
			}
			$scope.currentImage =$scope.images[cnt].path;
	$scope.currentDesc = $scope.images[cnt].desc;
	cnt++;
		}

	})
	.catch(function(error){
		console.log(error.data);
		alert("Error");
	});
	
}

$scope.changeImageNext = function()
{
	if(cnt >= $scope.images.length - 1){
		cnt = 0
	}
	else{
		cnt++;
	}
	
	$scope.currentImage =$scope.images[cnt].path;
	$scope.currentDesc = $scope.images[cnt].desc;
}

$scope.changeImagePrev = function()
{
	console.log($scope.images + " Object" );
	if(cnt <= 0){
		cnt = $scope.images.length - 1;
	}
	else{
		cnt--;
	}
	$scope.currentImage =$scope.images[cnt].path;
	$scope.currentDesc = $scope.images[cnt].desc;
}

var icon = {
	url: "D:/Museum Aggregators/Museum/icn2.png", // url
	scaledSize: new google.maps.Size(50, 50), // scaled size
	origin: new google.maps.Point(0,0), // origin
	anchor: new google.maps.Point(0, 0) // anchor
};
var iconmuseum = {
	url: "D:/Museum Aggregators/Museum/museum.png", // url
	scaledSize: new google.maps.Size(50, 50), // scaled size
	origin: new google.maps.Point(0,0), // origin
	anchor: new google.maps.Point(0, 0) // anchor
};
$scope.setLocation = function() 
	{
	
    	if(navigator.geolocation) 
    		{
        		navigator.geolocation.getCurrentPosition($scope.showPosition);
				$scope.getMuseums();
			} 
    		else 
    		{
        		alert("Geolocation is not supported by this browser.");
    		}
	}

	$scope.showPosition = function(position) 
	{
    	$scope.latitude =  position.coords.latitude; 
    	$scope.longitude = position.coords.longitude;
    	$scope.myMap();
	}
	function distance(lat1, lon1, lat2, lon2, unit) {
		var radlat1 = Math.PI * lat1/180
		var radlat2 = Math.PI * lat2/180
		var theta = lon1-lon2
		var radtheta = Math.PI * theta/180
		var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
		dist = Math.acos(dist)
		dist = dist * 180/Math.PI
		dist = dist * 60 * 1.1515
		if (unit=="K") { dist = dist * 1.609344 }
		if (unit=="N") { dist = dist * 0.8684 }
		if(dist < 1 ) return ""+Math.round(dist * 1000)+" Meter"
		else
		return ""+parseFloat(dist).toFixed(2)+" Km"
	}
	$scope.setMarkers = function(){
		for(var count = 0; count < $scope.data.length; count++) 
		{
		
		
			 $scope.marker = new google.maps.Marker(
				 {
					  position: new google.maps.LatLng($scope.data[count].lat,$scope.data[count].lng),
					  map: $scope.map,
					  icon : iconmuseum,
					  title: "Museum Name : "+$scope.data[count].mname +"\nDistance : "+ distance($scope.latitude,$scope.longitude,$scope.data[count].lat,$scope.data[count].lng)
				});
			google.maps.event.addListener($scope.marker, 'click', (function (marker, id) 
			{
				  return function () 
				  {
					        localStorageService.set("museumId",id);  
							window.open("Museum_page.html","_self");
						
					  }
			})($scope.marker,$scope.data[count]._id));
		  }	

	};
	
    $scope.myMap =   function() 
{

	$scope.myProp = 
	{
		center:new google.maps.LatLng($scope.latitude,$scope.longitude),
		zoom:15
	};
	 $scope.map = new google.maps.Map(document.getElementById("map_canvas"),$scope.myProp);

	 $scope.myLocation = new google.maps.Marker(
		{
			position: { lat:$scope.latitude , lng:$scope.longitude},
			map:$scope.map,
			label: "You Are Here",
			draggable:false,
			animation: google.maps.Animation.DROP
			
		});
		var options = {
			types: ['(cities)'],
			componentRestrictions: {country: "in"}
		   };
		  
		   
		   
	}
	
	$scope.getLatLng = function()
	{
	
	  $scope.geocoder.geocode( { 'address': $scope.cityname}, function(results, status) 
		  {
			  if (status == google.maps.GeocoderStatus.OK) 
				  {
					  $scope.latitude = results[0].geometry.location.lat();
						 $scope.longitude = results[0].geometry.location.lng();
						 $scope.map.setCenter(new google.maps.LatLng($scope.latitude,$scope.longitude));
						 $scope.map.setZoom(12);
	                    // $scope.map =google.maps.Map(document.getElementById("map_canvas"),$scope.myProp);
				  }
		  }); 
		  
	}
  
	$scope.goLogin = function() 
 				{
        			window.location.href = 'login.html'
    			};

 	$scope.goBeAPartner = function() 
 				{
        			window.location.href = 'beapartner.html'
				};
				
   $scope.getMuseums = function(){
	$http.get(
		'http://localhost:3000/museum/index',
		)
		.then(function(response)
			{
				$scope.data=response.data;
			
				setTimeout(() => {
				$scope.setMarkers();	
				}, 5000);
			})
			.catch(function(error){
				alert(error.data);
			});

};
	}]);


myModule.controller("loginController",['$scope','fileUpload','$http','localStorageService',function($scope,fileUpload,$http,localStorageService){

	
	$scope.uploadFile = function(fd){
		$http.post('http://localhost:3000/museum/image', fd, {
		 transformRequest: angular.identity,
		 headers: {'Content-Type': undefined}
	  })
		.then(function(response){
		
			logoPath= response.data.path;
		    console.log(logoPath);
		})
		.catch(function(error){
		 console.log(error.data);
		});
 

	 };
$scope.mon="false";
$scope.tue="false";
$scope.wed="false";
$scope.thu="false";
$scope.fri="false";
$scope.sat="false";
$scope.sun="false";
$scope.userId="";
$scope.token;	
$scope.geocoder = new google.maps.Geocoder();
$scope.addr;
$scope.latitude;
$scope.longitude;
$scope.map;
$scope.myProp;

$scope.loginUser = function ()
            {
                $http.post(
                    'http://localhost:3000/museum/login',
                    {"email":$scope.username , "password":$scope.password}
                )
                .then(function(response){
                    if(response.status == 200 )
                    {
						 
						alert ("Login Successful");
						var v = localStorageService.set("usrId", response.data.userId);
					
					 	
						window.open("admin_main.html","_self");	
                    }

				})
				.catch(function(error){
					console.log(error);
					alert("Error");
				});
				
			};
			
$scope.resetPasswordField = function()
{
	$scope.oldPass = "";
	$scope.newPass = "" ;
	$scope.cNewPass  = "" ;

}			
$scope.changePassword = function(){

	if($scope.newPass != $scope.cNewPass){
		alert("password Not Matched");
		$scope.resetPasswordField();
	}
	else{

		$http.patch(
			'http://localhost:3000/museum/changePass/'+localStorageService.get("usrId"),
			{"oldPass":$scope.oldPass , "newPass":$scope.newPass}
		)
		.then(function(response){
			if(response.status == 200 )
			{
				alert("password change successfully");
				window.open("admin_main.html","_self");
	
			}
		   else{
				   alert ("Change Password Fail");    
			   }
	
		})
		.catch(function(error){
			console.log(error.data);
			alert("Wrong Password");
		});

	}

	
}

$scope.forgotPassword = function(){

	$http.patch(
		'http://localhost:3000/museum/forgotPassword',
		{"email":$scope.femail}
	)
	.then(function(response){
		if(response.status == 200 )
		{
			alert("Password has been sent to your emsil");

		}

	})
	.catch(function(error){
		console.log(error.data.message);
	});
}

$scope.updateData = function(){
	var obg={
		mon:{isOpen:$scope.mon,from:$scope.mon_from,to:$scope.mon_to},
		tue:{isOpen:$scope.tue,from:$scope.tue_from,to:$scope.tue_to},
		wed:{isOpen:$scope.wed,from:$scope.wed_from,to:$scope.wed_to},
		thu:{isOpen:$scope.thu,from:$scope.thu_from,to:$scope.thu_to},
		fri:{isOpen:$scope.fri,from:$scope.fri_from,to:$scope.fri_to},
		sat:{isOpen:$scope.sat,from:$scope.sat_from,to:$scope.sat_to},
		sun:{isOpen:$scope.sun,from:$scope.sun_from,to:$scope.sun_to}
	};
	$http.patch('http://localhost:3000/museum/updateMuseumDetail/'+localStorageService.get("usrId"),
	{
			"name":$scope.name,
			"mname":$scope.mname,
  			"cno":$scope.cno,
   			"address":$scope.address,
   			"pincode":$scope.pincode,
   			"city":$scope.city,
   			"lat":$scope.latitude,
   			"lng":$scope.longitude,
   			"website":$scope.website,
   			"facebook":$scope.facebook,
   			"twitter":$scope.twitter,
   			"insta":$scope.instagram,
   			"youtube":$scope.youtube,
   			"timming":obg
			
	})
	.then(function(response){

		alert("Data Updated");
		window.open("admin_main.html","_self");

	})
	.catch(function(error){
		console.log(errer.data);
		alert("Error");
	})
}
$scope.getData = function(){

	$http.get('http://localhost:3000/museum/museumDetail/'+localStorageService.get("usrId"),
	{}
	)
	.then(function(response){
		
		$scope.name = response.data.name;
		$scope.mname = response.data.mname;
		$scope.cno=response.data.cno;
		$scope.website = response.data.website;
		$scope.address = response.data.address;
		$scope.pincode = response.data.pincode;
		$scope.city = response.data.city;
		$scope.latitude = response.data.lat;
		$scope.longitude = response.data.lng;

		$scope.mon = response.data.timming.mon.isOpen;
		$scope.mon_from = response.data.timming.mon.from;
		$scope.mon_to = response.data.timming.mon.to;

		$scope.tue = response.data.timming.tue.isOpen;
		$scope.tue_from = response.data.timming.tue.from;
		$scope.tue_to = response.data.timming.tue.to;

		$scope.wed = response.data.timming.wed.isOpen;
		$scope.wed_from = response.data.timming.wed.from;
		$scope.wed_to = response.data.timming.wed.to;

		$scope.thu = response.data.timming.thu.isOpen;
		$scope.thu_from = response.data.timming.thu.from;
		$scope.thu_to = response.data.timming.thu.to;

		$scope.fri = response.data.timming.fri.isOpen;
		$scope.fri_from = response.data.timming.fri.from;
		$scope.fri_to = response.data.timming.fri.to;

		$scope.sat = response.data.timming.sat.isOpen;
		$scope.sat_from = response.data.timming.sat.from;
		$scope.sat_to = response.data.timming.sat.to;
		
		$scope.sun = response.data.timming.sun.isOpen;
		$scope.sun_from = response.data.timming.sun.from;
		$scope.sun_to = response.data.timming.sun.to;

		$scope.twitter = response.data.twitter;
		$scope.youtube = response.data.youtube;
		$scope.facebook = response.data.facebook;
		$scope.instagram = response.data.insta;
		$scope.checkValidation();
		$scope.myMap();
	})
	.catch(function(error){
		alert(error.data);
	});
};
/////////////////////////City from pincode



function codeLatLng() {
    var latlng = new google.maps.LatLng($scope.latitude,$scope.longitude);
    var gcoder = new google.maps.Geocoder();
    gcoder.geocode({'latLng': latlng}, function(results, status) 
    {
      if (status == google.maps.GeocoderStatus.OK) 
      {
		var arrAddress = results[0].address_components;
		$.each(arrAddress, function (i, address_component) 
		{			
    		if (address_component.types[0] == "locality")
    		{
        		var town=address_component.short_name;
        		
    		}
		});
    }
    });
  }


/////////////////////////////city end


$scope.setCityName = function()
{
	if($scope.pincode.length == 6)
	{
		var gcoder = new google.maps.Geocoder();
		gcoder.geocode( { 'address': $scope.pincode}, function(results, status) 
		{
			if (status == google.maps.GeocoderStatus.OK) 
				{
		
				for(var i=0;i<results[0].address_components.length ; i++)
				{
					if(results[0].address_components[i].types[0]=="locality")
					{
						
					$scope.city=results[0].address_components[i].short_name;
					
					$scope.getLatLng();

					}
				}
				}
		});
	}
}


$scope.getLatLng = function()
  {
  	
	$scope.addr=$scope.address +" "+ $scope.city ;
	
	$scope.geocoder.geocode( { 'address': $scope.addr}, function(results, status) 
		{
			if (status == google.maps.GeocoderStatus.OK) 
				{
    				$scope.latitude = results[0].geometry.location.lat();
   					$scope.longitude = results[0].geometry.location.lng();
    				$scope.myMap();
    			}
		}); 
  }

$scope.myMap =   function() 
	{
		
    	$scope.myProp = 
    	{
    		center:new google.maps.LatLng($scope.latitude,$scope.longitude),
    		zoom:15
		};
 		$scope.map = new google.maps.Map(document.getElementById("map_canvas"),$scope.myProp);

		$scope.marker = new google.maps.Marker(
			{
    			map:$scope.map,
    			draggable:true,
    			animation: google.maps.Animation.DROP,
    			position: { lat:$scope.latitude , lng:$scope.longitude}
			});

		google.maps.event.addListener($scope.marker, 'dragend', function(evt) 
			{
    			$scope.latitude = evt.latLng.lat();
    			$scope.longitude = evt.latLng.lng();
    			$scope.myMap();
			});
	}

$scope.setLocation = function() 
	{
		
    	if(navigator.geolocation) 
    		{
        		navigator.geolocation.getCurrentPosition($scope.showPosition);
    		} 
    		else 
    		{
        		alert("Geolocation is not supported by this browser.");
    		}
	}

$scope.showPosition = function(position) 
	{
    	$scope.latitude =  position.coords.latitude; 
    	$scope.longitude = position.coords.longitude;
    	$scope.myMap();
	}
		

$scope.checkValidation = function() 
{
	
	if($scope.mon == "false")
	{
		$scope.isMon = true ; 
		$scope.mon_from="";
		$scope.mon_to="";
	}
	if($scope.mon == "true")
	{
		$scope.isMon = false ; 
	}

	if($scope.tue == "false")
	{
		$scope.isTue = true ; 
		$scope.tue_from="";
		$scope.tue_to="";
	}
	if($scope.tue == "true")
	{
		$scope.isTue = false ; 
	}

	if($scope.wed == "false")
	{
		$scope.isWed = true ; 
		$scope.wed_from="";
		$scope.wed_to="";
	}
	if($scope.wed == "true")
	{
		$scope.isWed = false ; 
	}


	if($scope.thu == "false")
	{
		$scope.isThu = true ; 
		$scope.thu_from="";
		$scope.thu_to="";
	}
	if($scope.thu == "true")
	{
		$scope.isThu = false ; 
	}


	if($scope.fri == "false")
	{
		$scope.isFri = true ; 
		$scope.fri_from="";
		$scope.fri_to="";
	}
	
	if($scope.fri == "true")
	{
		$scope.isFri = false ; 
	}

	if($scope.sat == "false")
	{
		$scope.isSat = true ; 
		$scope.sat_from="";
		$scope.sat_to="";
	}
	
	if($scope.sat == "true")
	{
		$scope.isSat = false ; 
	}

	if($scope.sun == "false")
	{
		$scope.isSun = true ; 
		$scope.sun_from="";
		$scope.sun_to="";
	}
	
	if($scope.sun == "true")
	{
		$scope.isSun = false ; 
	}

}


$scope.signupUser = function ()
{
	    var file = $scope.myFile;
		var fd = new FormData();
		fd.append('file', file);
	console.log("FUnction Called");
	$scope.uploadFile(fd);

	console.log($scope.mon+", "+$scope.mon_from+" , "+$scope.mon_to);
	var obg={
			mon:{isOpen:$scope.mon,from:$scope.mon_from,to:$scope.mon_to},
			tue:{isOpen:$scope.tue,from:$scope.tue_from,to:$scope.tue_to},
			wed:{isOpen:$scope.wed,from:$scope.wed_from,to:$scope.wed_to},
			thu:{isOpen:$scope.thu,from:$scope.thu_from,to:$scope.thu_to},
			fri:{isOpen:$scope.fri,from:$scope.fri_from,to:$scope.fri_to},
			sat:{isOpen:$scope.sat,from:$scope.sat_from,to:$scope.sat_to},
			sun:{isOpen:$scope.sun,from:$scope.sun_from,to:$scope.sun_to}
		};
		console.log(obg);

	
	$http.post(
		'http://localhost:3000/museum/signup',
		{
			"name":$scope.name,
			"mname":$scope.mname,
    		"email":$scope.email,
  			"cno":$scope.cno,
   			"address":$scope.address,
   			"pincode":$scope.pincode,
   			"city":$scope.city,
   			"lat":$scope.latitude,
   			"lng":$scope.longitude,
   			"logo":file.name,
   			"website":$scope.website,
   			"facebook":$scope.facebook,
   			"twitter":$scope.twitter,
   			"insta":$scope.instagram,
   			"youtube":$scope.youtube,
			"timming":obg 
		})
	.then(function(response)
	{
		if(response.status == 200 ){
			alert ("Successful");
			window.open("index.html","_self");
			
		}
	})
	.catch(function(error)
	{
		
		console.log(error);
		alert("Error Found");
	});

};

}]);

