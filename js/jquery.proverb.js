// define array globally
let splittedWord3Arr = []
let scrambledAnswerArr = []
let allProverbs = []

// this is to hold the re.term and will be used in .data method 
//   which will convert to masked label
let reqTerm = ''

// Recursive approach to check if an
// Array is sorted or not

// Function that returns 0 if a pair
// is found unsorted
    function arraySortedOrNot(arr, n)
    {
    
    // Array has one or no element or the
    // rest are already checked and approved.
    if (n == 1 || n == 0)
        return 1;

    // Unsorted pair found (Equal values allowed)
    if (arr[n - 1] < arr[n - 2])
        return 0;

    // Last pair was sorted
    // Keep on checking
    return arraySortedOrNot(arr, n - 1);
    }

    function arrayEquals(a, b) {
        return Array.isArray(a) &&
                Array.isArray(b) &&
                a.length === b.length &&
                a.every((val, index) => val === b[index]);
    }

    // This function derives the object from chosen SN
    function process1(srno) {
    // var obj1 = getData3("700");


    var obj1 = getData3(srno)
    let ans = obj1.answer ? myTrim(obj1.answer): ''
    // let ans = 'जनगणमन'
    let eclue = obj1.clue ? obj1.clue: ''
    // let mclue = obj1.marathiClue ? obj1.marathiClue: ''
    $("#englishClue").text('Clue: '+eclue).addClass("w3-panel w3-pale-blue w3-leftbar w3-border-blue").show()
    // add this later in below line: +mclue
    // $("#marathiClue").text('Marathi Clue: ').addClass("w3-panel w3-pale-blue w3-leftbar w3-border-blue")

                
    // clear previous choice entries
    splittedWord3Arr = []
    let a3 = SplitIndicWord(ans)
    res3 = {}
    while (!res3.done) {
        res3 = a3.next();
        if (res3.value) {
        splittedWord3Arr.push(res3.value);
        // console.log(res3.value);
        }
    }
    // console.log(splittedWord3Arr)
    // clear previous choice entries
    scrambledAnswerArr = []
    // make a copy of splittedWord3Arr for scrambling
    scrambledAnswerArr = [...splittedWord3Arr]

    // call process2
    process2();
    }

    // This function is invoked when user enters search string and selects the value provided by autocomplete
    function process1A(proverb) {
        // console.log(proverb)
        // console.log($("#specificWord-desc").text())
    let ans = proverb ? myTrim(proverb): ''
    // let ans = 'जनगणमन'
    // let eclue = $("#specificWord-desc").text() ? $("#specificWord-desc").text(): ''
    // let mclue = obj1.marathiClue ? obj1.marathiClue: ''
    // $("#englishClue").text('English Clue: '+eclue).addClass("w3-panel w3-pale-blue w3-leftbar w3-border-blue")
    // add this later in below line: +mclue
    // $("#marathiClue").text('Marathi Clue: ').addClass("w3-panel w3-pale-blue w3-leftbar w3-border-blue")

                
    // clear previous choice entries
    splittedWord3Arr = []
    let a3 = SplitIndicWord(ans)
    res3 = {}
    while (!res3.done) {
        res3 = a3.next();
        if (res3.value) {
        splittedWord3Arr.push(res3.value);
        // console.log(res3.value);
        }
    }
    // console.log(splittedWord3Arr)
    // clear previous choice entries
    scrambledAnswerArr = []
    // make a copy of splittedWord3Arr for scrambling
    scrambledAnswerArr = [...splittedWord3Arr]

    // call process2
    process2();
    }

    // add the List Item (li) Elements to the unorder list (ul) with ID attribute
    function generateLi(item, index) {
        $("ul").append('<li id="LI_' + index + '" class="ui-state-default">' + item + '</li>');
    }


function process2() {
  // Scramble it using the sort method
  scrambledAnswerArr.sort(function() { return 0.5 - Math.random() })

  // create list item elements scrambledAnswerArrfrom 
  scrambledAnswerArr.forEach(generateLi);

  $( "#sortable, #sortable li").sortable({
    update: function(event, ui) 
    {
        var liIDArr = $(this).sortable('toArray');
        // let sortedAnswerArr = []
        
        // console.log(liIDArr)
        // derive the text of each li using the id 
        
          sortedAnswerArr = liIDArr.map(element => {
            // console.log($("#"+element).text())
            return $("#"+element).text()
          })
          // console.log(liIDArr)
        
        // console.log(sortedAnswerArr)
        // console.log(splittedWord3Arr)
        
        // for every element of List Item ID Array 
        //   if value at index is matched between sortedAnswerArr and splittedWord3Arr
        //   then set the background-color of LI_ID

        liIDArr.every((liID, index) => sortedAnswerArr[index] === splittedWord3Arr[index] ?
          $("#"+liID).css("background-color", "cyan"):
          ''
        )

        if (arrayEquals(sortedAnswerArr, splittedWord3Arr)) {
          alert('अभिनंदन/ Congratulations...')
          
          $("li").css("background-color", "yellow")
          // turn clockwise
          $('li').animate(
            { deg: 360 },
            {
              duration: 1200,
              step: function(now) {
                $(this).css({ transform: 'rotate(' + now + 'deg)' });
              }
            }
          );
          // turn anti-clockwise
          $('li').animate(
            { deg: -360 },
            {
              duration: 1200,
              step: function(now) {
                $(this).css({ transform: 'rotate(' + now + 'deg)' });
              }
            }
          );
          
          $("li").slideUp('fast');
          $("li").slideDown('slow');
          $("li").fadeOut(3000);
          $("#englishClue").fadeOut(3000);
          $("#showAnswerbtn").hide()
          $("#showFirstLastbtn").hide()
          
          
        }
    }
  });    
  $( "#sortable" ).disableSelection();
} // end of process2


// to remove space before, in between and after 
// to remove comma
function myTrim(x) {
    return x.replace(/\s+|\s+|,+/gm,'');
  }


  $(document).ready(function() {

    // hide the other two buttons
    $("#showAnswerbtn").hide()
    $("#showFirstLastbtn").hide()
    
    // fetch data from this end point
    // let url = 'http://localhost:5000/api/proverbs/all_proverbs'
    let url = 'https://scrambledmarathiproverbs1.herokuapp.com/api/proverbs/all_proverbs'
    fetch(url).then(function(response) {
          return response.json()
        }).then(function(json) {
          // console.log(json)
          allProverbs = json;
          // console.log( 'allProverbs isArray:', Array.isArray(allProverbs))
        });

    // console.log(proverbs)
    $("#specificWord").autocomplete({        
      minLength: 0,
      // source: proverbs,
      source: function(req, responseFn) {
          // escape all regexp characters
          // console.log('req.term: ' + req.term)
          // var re = $.ui.autocomplete.escapeRegex(req.term);
          matcher = new RegExp(req.term);
          reqTerm = req.term
          // console.log('matcher on assigning: ' + matcher)
          // var a = $.grep( proverbs, function(item,index){
          var a = $.grep( allProverbs, function(item,index){
            
              return matcher.test(item.label);
          });
          responseFn( a );
      },
      focus: function( event, ui ) {
        $( "#specificWord" ).val( reqTerm );
          return false;
      },
      select: function( event, ui ) {
        
        $( "#specificWord-id" ).val( ui.item.label );
        // $( "#sn" ).val( ui.item.value );
        // $( "#specificWord-desc" ).html( ui.item.desc );
        $("#englishClue").text('Clue: '+ ui.item.desc).addClass("w3-panel w3-pale-blue w3-leftbar w3-border-blue").show()    
        
        return false;
      }
    })
    // .data( "ui-autocomplete" )._renderItem = function( ul, item ) {
    .autocomplete( "instance" )._renderItem = function( ul, item ) {
        // console.log('reqTerm: ' + reqTerm)
        const regex = /[^reqTerm| ]/gu;
        const subst = `X`;
  
        // The substituted value will be contained in the result variable
        const result = item.label.replace(regex, subst);
        // console.log('result:' + result)
        return $( "<li>" )
        .append( "<div>" + result + "<br>" +  item.desc + "</div>" )
        .appendTo( ul );
    };
  
  
    // console.log('Value selected is: ' + $("#sn").val())
    $("#showByIDbtn").click(function() {
      // clear li of previous choice, if user choose another puzzle immediately
      $("li").remove(".ui-state-default")
      // call process1 which does the required computations
      // process1( $("#sn").val() )
      
      process1A($( "#specificWord-id" ).val())
      $("#showAnswerbtn").show()
      $("#showFirstLastbtn").show()
    });
  
    
    $("#showFirstLastbtn").click(function() {
      alert('First: ' + splittedWord3Arr[0] + '\n' + 'Last: ' + splittedWord3Arr[splittedWord3Arr.length-1] )
    });
  
    $("#showAnswerbtn").click(function() {
      // clear li of previous choice
      $("li").remove(".ui-state-default")
      // generate li from the splittedWord3Arr
      splittedWord3Arr.forEach(generateLi);
    });

    // link to Add new proverb page
/*     $("#addNewProverb").click(function() {
      $.ajax({
        url: "http://localhost:5000/api/proverbs/create",
        success: function(data){ 
            // $('#data').text(data);
            alert("No error.");
        },
        error: function(){
          alert("There was an error.");
        }
      });

    });
 */
    // clear the englishClue when mouse enters specificWord
    $("#specificWord").focus(function () { 
      $("li").remove(".ui-state-default")
      $("#englishClue").text('')
    });
  });
  