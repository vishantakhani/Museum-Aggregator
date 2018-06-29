/// <reference path="https://ajax.googleapis.com/ajax/libs/angularjs/1.6.9/angular.min.js" />


var myModule=angular.module("myModule",[]);




myModule.controller("indexController",function($scope,$http){

	$scope.homeLogo="bg-01.jpg";

 	$scope.goLogin = function() 
 				{
        			window.location.href = 'login.html'
    			};

 	$scope.goBeAPartner = function() 
 				{
        			window.location.href = 'beapartner.html'
    			};
	});


myModule.controller("loginController",function($scope,$http){
$scope.userId="None";
	$scope.loginUser = function ()
				{
					$http.post(
								'http://localhost:3000/museum/login',
								{"email":$scope.username,"password":$scope.password}
								)
								.then(function(response)
									{
										if(response.status == 200 )
											{
												$scope.userId=response.data.userId;
												console.log($scope.userId);
												var token = response.data.token;
												alert ("Login Successful" +$scope.userId);
												// window.open("updateinfo.html","_self");
											}
	   									else{
											   	alert ("Login Fail");	
											   }
									});
				};
	
////new controller



$scope.getData = function(){
	console.log("Function Called" + $scope.userId);
	$http.get('http://localhost:3000/museum/museumDetail/5b2237fbc8486d3924a8be3f',
	{}
	)
	.then(function(response){
		console.log(response.data);
	});
};

$scope.geocoder = new google.maps.Geocoder();
$scope.addr;
$scope.latitude;
$scope.longitude;
$scope.map;
$scope.myProp;






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
        		console.log(town);
    		}
		});
    }
    });
  }








/////////////////////////////city end








$scope.setCityName = function()
{
	console.log($scope.pincode);
	if((''+$scope.pincode).length == 6)
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
					

					}
				}
				}
				else{
					$scope.city="";
				}
		});
	}
}


$scope.getLatLng = function()
  {
	  $scope.setCityName();
  	console.log("getLatLng called");
	$scope.addr=$scope.address +" "+ $scope.city ;
	console.log($scope.addr);
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
		console.log("Map called");
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
		console.log("Set Location");
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
		



//////////////////////


$scope.checkValidation = function() {
console.log("check valid");

if($scope.mon == "false"){
$scope.isMon = true ; 
$scope.mon_from="";
$scope.mon_to="";
}
if($scope.mon == "true"){
$scope.isMon = false ; 
}


if($scope.tue == "false"){
$scope.isTue = true ; 
$scope.tue_from="";
$scope.tue_to="";
}
if($scope.tue == "true"){
$scope.isTue = false ; 
}


if($scope.wed == "false"){
$scope.isWed = true ; 
$scope.wed_from="";
$scope.wed_to="";
}
if($scope.wed == "true"){
$scope.isWed = false ; 
}


if($scope.thu == "false"){
$scope.isThu = true ; 
$scope.thu_from="";
$scope.thu_to="";
}
if($scope.thu == "true"){
$scope.isThu = false ; 

}


if($scope.fri == "false"){
$scope.isFri = true ; 
$scope.fri_from="";
$scope.fri_to="";
}
if($scope.fri == "true"){
$scope.isFri = false ; 
}


if($scope.sat == "false"){
$scope.isSat = true ; 
$scope.sat_from="";
$scope.sat_to="";
}
if($scope.sat == "true"){
$scope.isSat = false ; 
}


if($scope.sun == "false"){
$scope.isSun = true ; 
$scope.sun_from="";
$scope.sun_to="";
}
if($scope.sun == "true"){
$scope.isSun = false ; 
}

}




$scope.signupUser = function (){
//////////////////////////
	$http.post(
		'http://localhost:3000/museum/signup',
		{
			"mname":$scope.mname,
    		"email":$scope.email,
   			"password":$scope.password,
  			"cno":$scope.cno,
   			"address":$scope.address,
   			"pincode":$scope.pincode,
   			"city":$scope.city,
   			"lat":$scope.latitude,
   			"lng":$scope.longitude,
   			"logo":$scope.mlogo,
   			"website":$scope.website,
   			"facebook":$scope.facebook,
   			"twitter":$scope.twitter,
   			"insta":$scope.instagram,
   			"youtube":$scope.youtube,
   			"description":$scope.description,
   			"history":$scope.history,
   			"timming":{
						   "mon":{
						    
						       "isOpen":$scope.mon,
						       "from":$scope.mon_from,
						       "to":$scope.mon_to
						   },
						"tue":{
						      
						       "isOpen":$scope.tue,
						       "from":$scope.tue_from,
						       "to":$scope.tue_to
						   },
						  "wed": {
						     
						       "isOpen":$scope.wed,
						       "from":$scope.wed_from,
						       "to":$scope.wed_to
						   },
						"thu":{
						      
						       "isOpen":$scope.thu,
						       "from":$scope.thu_from,
						       "to":$scope.thu_to
						   },
						   "fri":{
						      
						       "isOpen":$scope.fri,
						       "from":$scope.fri_from,
						       "to":$scope.fri_to
						   },
						   "sat":{
						       
						       "isOpen":$scope.sat,
						       "from":$scope.sat_from,
						       "to":$scope.sat_to
						   },
						   "sun":{
						       "isOpen":$scope.sun,
						       "from":$scope.sun_from,
						       "to":$scope.sun_to
						   }
						   
   						},
   						"images":{

   						}
		})
	//////////////////
	.then(function(response)
	{
		if(response.status == 200 ){
					alert ("Successful");
			window.open("login.html","_self");
			
		}
	   else{
	   	alert ("Signup Fail");
			
	   }
	});

};










///end of new controller









	});

