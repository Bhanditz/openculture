/*
 * Single Window Application Template:
 * A basic starting point for your application.  Mostly a blank canvas.
 * 
 * In app.js, we generally take care of a few things:
 * - Bootstrap the application with any data we need
 * - Check for dependencies like device type, platform version or network connection
 * - Require and open our top-level UI component
 *  
 */


/** This file is part of muse-opensource
  *
  *      @desc Main admin code
  *   @package muse-open-source
  *    @author Jonathan Carter <jc@glimworm.com>
  * @copyright 2013 glimworm IT BV
  *   @license http://www.opensource.org/licenses/gpl-2.0.php GPLv2
  *   @license http://www.opensource.org/licenses/lgpl-2.1.php LGPLv2
  *      @link http://www.muse-opensource.org
  */



var globals = require('/ui/common/globals');
//bootstrap and check dependencies
var LL = function(txt) {
	try {
		var rv = L(txt.replace(" ","_"));
		if (rv == "") return txt;
		return rv;
	} catch (E) {
		return txt;			
	}
};


if (Ti.Platform.osname === 'android') {
	
	var pDPI = Ti.Platform.displayCaps.dpi;
	var pWidth = (Ti.Platform.displayCaps.platformWidth / pDPI) ;
	var pHeight = (Ti.Platform.displayCaps.platformHeight / pDPI);

	var diagnonal = Math.sqrt((pWidth * pWidth) + (pHeight * pHeight));
	Ti.API.debug("jcjcjc diaginal width = "+diagnonal);
	if (diagnonal < 9) {
		// require("/etc/config").setformat("phone");
	}
	
	
	var ApplicationWindow = require('/ui/android/ApplicationWindow');
	var appwin = new ApplicationWindow();
	appwin.open();

	var activity = appwin.activity;
	
	activity.onPrepareOptionsMenu = function(e){
		Ti.API.info("jcjc menu pressed []");
		Ti.App.fireEvent('togglemainviewWrapper',{});
	};
	
	var LOC = Ti.Locale.getCurrentLocale();
	Ti.App.addEventListener("app:checklocale", function() {
		if (LOC !== Ti.Locale.getCurrentLocale()) {
			
			var dialog = Ti.UI.createAlertDialog({
			    buttonNames: [LL('close_app')],
			    message: LL('locale_message'),
				title: LL('locale_title')
			});
			dialog.addEventListener('click', function(e){
				var intent = Ti.Android.currentActivity.getIntent();
				Ti.Android.currentActivity.finish();
		//		Ti.Android.currentActivity.startActivity(intent);
			});
			dialog.show();
		}
	});

} else if (Ti.Platform.osname === 'ipad' || Ti.Platform.osname === 'iphone') {
	if (Ti.Platform.osname === 'iphone') {
		// require("/etc/config").setformat("phone");
	}
	
	var ApplicationWindow = require('/ui/ios/ApplicationWindow');
	new ApplicationWindow().open();
	

	require("/helpers/flurry").log("ApplicationStart",{ "osname": Ti.Platform.osname });

	require("/ui/common/globals").set("deviceToken","");
	
	var push = Ti.Network.registerForPushNotifications({
	    types: [
	        Titanium.Network.NOTIFICATION_TYPE_BADGE,
	        Titanium.Network.NOTIFICATION_TYPE_ALERT,
	        Titanium.Network.NOTIFICATION_TYPE_SOUND
	    ],
		callback : function(e) {
	        // alert("Received a push notification\n\nPayload:\n\n"+JSON.stringify(e.data));
		},
		error : function(e) {
			// alert(e)
		},
		success : function(e) {
			// alert(e);
			
			try {
				var deviceToken = e.deviceToken;
				require("/ui/common/globals").set("deviceToken",deviceToken);
	
				var Cloud = require('ti.cloud');
				
				Cloud.Users.login({
				    login: 'acs1',
				    password: 'acs1'
				}, function (e) {
				    if (e.success) {
				        var user = e.users[0];
				        // alert('Success:\\n' +
				            // 'id: ' + user.id + '\\n' +
				            // 'first name: ' + user.first_name + '\\n' +
				            // 'last name: ' + user.last_name);
				            
				            
						Cloud.PushNotifications.subscribe({
					    	channel: 'general',
					    	device_token: deviceToken
					    }, function (e) {
						    if (e.success) {
//						        alert('Success for global channel');
						    } else {
						        // alert('Error global:\\n' + ((e.error && e.message) || JSON.stringify(e)));
						    }
						
							Cloud.PushNotifications.subscribe({
						    	channel: "uuid-"+require("/ui/common/globals").getuuid(),
						    	device_token: deviceToken
						    }, function (e) {
							    if (e.success) {
							        // alert('Success for uuid');
							    } else {
							        // alert('Error uuid:\\n' + ((e.error && e.message) || JSON.stringify(e)));
							    }
							});				            
						});	
				    } else {
				        // alert('Error:\\n' + ((e.error && e.message) || JSON.stringify(e)));
				    }
				});	
			} catch (err) {
				// alert('Error in Cloud:\\n' + (JSON.stringify(err)));
			}
			
			
			
		}
	});

} else if (Ti.Platform.osname === 'mobileweb') {
	var ApplicationWindow = require('/ui/ios/ApplicationWindow');
	new ApplicationWindow().open();

} else {

	alert(Ti.Platform.osname + ' is not yet supported by this template');
}

var gps = require("/services/gps");
gps.start();
Titanium.App.fireEvent("redisplay-search",{});