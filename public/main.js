angular.module("main",[]).controller('mainController', function($scope, $http, $window) {

$scope.logout = function () {
  $window.sessionStorage.removeItem("user");
  $scope.USER.loggedIn = false;
}

if ($window.sessionStorage.user) {
  $scope.USER = JSON.parse($window.sessionStorage.user);
} else {
  $scope.USER = {
    loggedIn : false
  };
}

$scope.remove = function (id, name) {
  var x = confirm("do you want to delete: " + name);
  if (x) {
  $http.delete("/api/sword/" + id).then (function (data) {
    alert("succes");
    $scope.calibrate();
  }, function (err) {
    console.log(err);
    alert("An error occurred")
  })
  }
}

$scope.formData = {};

function errorCallback (err) {
  Console.log("Error: " + err);
}

function findSwords (search, callb) {
  $http({url: "/api/sword",
      method: "GET",
      params: search
    }).then(callb, errorCallback);
}

$scope.calibrate = function ( ) {
findSwords({}, function (data) {

    $scope.swords = data.data;

  var shortest = 1000;
  var longest = 0;

  var lightest = 1000;
  var heaviest = 0;

  for (i =0; i < data.data.length; i++) {
      s = data.data[i];
      if (s.length > longest) {
        longest = s.length;
      }
      if (s.length < shortest) {
        shortest = s.length;
      }

      if (s.weight > heaviest) {
        heaviest = s.weight;
      }
      if (s.weight < lightest) {
        lightest = s.weight;
      }
  }


  $scope.heaviest = heaviest;
  $scope.longest = longest;
  $scope.lightest = lightest;
  $scope.shortest = shortest;

  $scope.selectedMinLength = shortest;
  $scope.selectedMinWeight = lightest;


  $scope.selectedMaxLength = longest;

  $scope.selectedMaxWeight = heaviest;

});
}
$http.get("/api/metal").then(function (data) {
  $scope.metals = data.data;
}, errorCallback );

$scope.search = function () {
  searchObj = {
    minLength : $scope.selectedMinLength,
    maxLength : $scope.selectedMaxLength
  };
  if ($scope.selectedName != "") {
    searchObj.name = $scope.selectedName;
  }

  findSwords(searchObj, function (data) {
    console.log(data.data)
    $scope.swords = data.data;
  })
}

$scope.calibrate();

});

angular.module("adm",[]).controller('adminController', function($routeParams, $scope, $http, $window) {

if ($routeParams.id != "new") {
  $http.get("/api/sword/" + $routeParams.id).then (function (data){
    $scope.metals = data.data.metals;
    $scope.facts = data.data.facts;
    $scope.name = data.data.name;
    $scope.weight = data.data.weight;
    $scope.length = data.data.length;
    $scope.history = data.data.history;
  }, function (err) {})
}

$scope.metals = [];
$scope.facts = [];

$http.get("/api/metal").then(function (data) {
  $scope.dataMetals = data.data;
}, function (err) {
  console.log("Error: " + err);
});

$scope.addFact = function () {
  $scope.facts.push($scope.fact)
}

$scope.removeFact = function (f) {
  for (var i = 0; i < $scope.facts.length; i++) {
    if (f == $scope.facts[i]) {
      $scope.facts.splice(i,1);
    }
  }
}

$scope.addMetal = function () {
  var included = false;

  if ($scope.metal == "") {
    included  = true;
  }

  for (var i = 0; i < $scope.metals.length; i++) {
    if ($scope.metal == $scope.metals[i]) {
      included = true;
    }
  }

  if (!included) {
    $scope.metals.push($scope.metal)
  }
}

$scope.removeMetal = function (m) {
  for (var i = 0; i < $scope.metals.length; i++) {
    if ($scope.metals[i] == m) {
      $scope.metals.splice(i,1)
    }
  }
}

$scope.submit = function () {
  /*
  console.log($scope.img)
  var f = document.getElementById('file').files[0],
       r = new FileReader();

   r.onloadend = function(e) {
     var data = e.target.result;
     //send your binary data via $http or $resource or do anything else with it
     console.log(data)
   }


   r.readAsBinaryString(f);
   */
  var s = {
    name : $scope.name,
    length : $scope.length,
    weight : $scope.weight,
    history : $scope.history,
    facts : $scope.facts,
    altImg: $scope.imgLink,
    metals : $scope.metals
  }


  if ($routeParams.id == "new") {
  $http.post("/api/sword", s).then (function (data) {
    alert("succes")
    console.log(data)
    $window.location.href = "/";
  }, function (err) {
    console.log(err);
    alert("An Error occurred, please try again later.")
  })
} else {

  $http.put("/api/sword/" + $routeParams.id,s).then(function (data) {
    alert("succes");
    $window.location.href = "/";
  }, function(err) {
    console.log(err);
    alert("Error");
  })
}
}

});

angular.module("swordView",[]).controller('swordViewController', function($routeParams,$scope, $http) {

  $http.get("/api/sword/" + $routeParams.id).then (function (data) {
    $scope.sword = data.data;

  }, function (err) {
    console.log("Error: " + err)
  })
});

angular.module("loginView",[]).controller("loginController", function ($scope, $http, $window) {
  $scope.submit = function () {
    user = {
      name : $scope.username,
      password : $scope.pass
    }
    $http.post('/api/admin/login', user).then(function (data) {

      if (data.data.succes) {
      //set user as logged in
      //and redirect
      $window.sessionStorage.setItem("user", JSON.stringify({loggedIn: true, name: user.name}))
      $window.location.href = "/";
      console.log("success")
      } else {
        alert("Username and password do not match.")
      }
    }, function (err) {
      alert("An Error occred, you cannot login at this time")
    })
  }
})
