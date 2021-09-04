
/**
* Jesse Weisbeck's Crossword Puzzle (for all 3 people left who want to play them)
*
*/
$(document).ready(function(){
	$.fn.crossword = function(entryData) {
			/*
				Qurossword Puzzle: a javascript + jQuery crossword puzzle
				"light" refers to a white box - or an input

				DEV NOTES: 
				- activePosition and activeClueIndex are the primary vars that set the ui whenever there's an interaction
				- 'Entry' is a puzzler term used to describe the group of letter inputs representing a word solution
				- This puzzle isn't designed to securely hide answerers. A user can see answerers in the js source
					- An xhr provision can be added later to hit an endpoint on keyup to check the answerer
				- The ordering of the array of problems doesn't matter. The position & orientation properties is enough information
				- Puzzle authors must provide a starting x,y coordinates for each entry
				- Entry orientation must be provided in lieu of provided ending x,y coordinates (script could be adjust to use ending x,y coords)
				- Answers are best provided in lower-case, and can NOT have spaces - will add support for that later
			*/
			
			var puzz = {}; // put data array in object literal to namespace it into safety
			puzz.data = entryData;
			
			// append clues markup after puzzle wrapper div
			// This should be moved into a configuration object

			// VR: changed from ol to ul to remove the Ordered Number on list item
			this.after('<div class="w3-container">');
			// this.after('<button id="uniqueSolved" class="w3-btn w3-blue  w3-left-align" style="width:15%">Is Solved?</button>');
			this.after('<button id="showFullSoln"  class="w3-btn w3-green w3-margin-right" style="width:15%">All Answers</button>');
			this.after('<button id="showCurrentSoln"  class="w3-btn w3-green w3-margin-right" style="width:15%">Current Answer</button>');
			this.after('</div>'); //  class="w3-container"

			this.after('<div class="w3-container">');
			this.after('<button id="showSolnLastLetter"  class="w3-btn w3-blue w3-margin-right" style="width:15%">All Last Letter</button>');
			this.after('<button id="showSolnFirstLetter" class="w3-btn w3-blue  w3-margin-right" style="width:15%">All First Letter</button>');
			this.after('</div>'); //  class="w3-container"

			this.after('<div class="w3-container">');
			this.after('<button id="showSolnLastLetterCurrent" class="w3-btn w3-lime  w3-margin-right" style="width:15%">Current Last Letter</button>');
			this.after('<button id="showSolnFirstLetterCurrent" class="w3-btn w3-lime  w3-margin-right" style="width:15%">Current First Letter</button>');
			this.after('</div>'); //  class="w3-container"

			this.after('<div class="w3-container">');
			this.after('<div id="puzzle-clues"><h4>Across(&rarr;)</h4><ul id="across" class="w3-container w3-hide"></ul><h4>Down(&darr;)</h4><ul id="down" class="w3-container w3-hide"></ul></div>');
			this.after('<button id="downBtn"   onclick="showAccordian(\'down\')"    class="w3-btn w3-grey  w3-left-align">Open Down</button>');
			this.after('<button id="acrossBtn" onclick="showAccordian(\'across\')"  class="w3-btn w3-black">Open Across</button>');
			this.after('</div>'); //  class="w3-container"
			
			// initialize some variables
			var tbl = ['<table id="puzzle">'],
			    puzzEl = this,
				clues = $('#puzzle-clues'),
				clueLiEls,
				coords,
				entryCount = puzz.data.length,
				entries = [], 
				rows = [],
				cols = [],
				solved = [],
				tabindex,
				$actives,
				activePosition = 0,
				activeClueIndex = 0,
				currOri,
				targetInput,
				mode = 'interacting',
				solvedToggle = false,
				z = 0;

			var puzInit = {
				
				init: function() {
					currOri = 'across'; // app's init orientation could move to config object
					
					// Reorder the problems array ascending by POSITION
					puzz.data.sort(function(a,b) {
						return a.position - b.position;
					});

					// Set keyup handlers for the 'entry' inputs that will be added presently
					puzzEl.delegate('input', 'keyup', function(e){
						mode = 'interacting';
						
						
						// need to figure out orientation up front, before we attempt to highlight an entry
						// 37:	left arrow, 38:	up arrow,  39:	right arrow, 40: down arrow
						switch(e.which) {
							case 39:
							case 37:
								currOri = 'across';
								break;
							case 38:
							case 40:
								currOri = 'down';
								break;
							default:
								break;
						}

						// if 9: tab key is pressed, 
						if ( e.keyCode === 9) {
							return false;
						} else if (
							e.keyCode === 37 ||
							e.keyCode === 38 ||
							e.keyCode === 39 ||
							e.keyCode === 40 ||
							e.keyCode === 8 ||
							e.keyCode === 46 ) {			
												

							// 46: delete, 8: backspace. VR commented: for delete
							if (e.keyCode === 8 || e.keyCode === 46) /* && !e.target.value) */ {
								currOri === 'across' ? nav.nextPrevNav(e, 37) : nav.nextPrevNav(e, 38); 
							} else {
								// VR: added as per bug#18 fix by Kiki-L
								//c return true;  
								nav.nextPrevNav(e);
							}

							e.preventDefault();
							return false;
						} 
						// VR added: to move to next cell when either Spacebar, Enter key press or  upon five characters
						else if(e.keyCode === 32 || e.keyCode === 13) /*|| e.target.value.length === 5)*/
						// if(e.which === 32 || e.which === 13) /*|| e.target.value.length === 5)*/
						{
							currOri === 'across' ? nav.nextPrevNav(e, 39) : nav.nextPrevNav(e, 40);
						}
						
						else {
							
							// console.log('input keyup: '+solvedToggle);
							
							puzInit.checkAnswer(e);

						}

						e.preventDefault();
						return false;					
					});
			
					// Set paste handlers for the 'entry' inputs that will be added presently
					puzzEl.delegate('input', 'paste', function(e){
						mode = 'interacting';
						// $("[data-coords='" + newCoord + "'].position-" + i + " input").val(splittedWord[j]);
						// $("[data-coords='1,1'].position-0 input").val('स');
						// access the clipboard using the api
						var pastedData = e.originalEvent.clipboardData.getData('text/plain') ;
						// To override the default behavior cancelling the default action
						e.preventDefault();
						puzInit.getCurrentSoln(myTrim(pastedData));
    					// alert(pastedData);
						puzInit.checkAnswer(e);
					});
			
					// tab navigation handler setup
					puzzEl.delegate('input', 'keydown', function(e) {

						if ( e.keyCode === 9) {
							
							mode = "setting ui";
							if (solvedToggle) solvedToggle = false;

							//puzInit.checkAnswer(e)
							nav.updateByEntry(e);
							
						} else {
							return true;
						}
												
						e.preventDefault();
									
					});
					
					// mouse click navigation handler setup
					puzzEl.delegate('input', 'click', function(e) {
						mode = "setting ui";
						if (solvedToggle) solvedToggle = false;

						// console.log('input click: '+solvedToggle);
					
						nav.updateByEntry(e);
						e.preventDefault();
									
					});
					
					
					// click/tab clues 'navigation' handler setup
					clues.delegate('li', 'click', function(e) {
						mode = 'setting ui';
						
						if (!e.keyCode) {
							nav.updateByNav(e);
						} 
						e.preventDefault(); 
					});
					
					
					// highlight the letter in selected 'light' - better ux than making user highlight letter with second action
					puzzEl.delegate('#puzzle', 'click', function(e) {
						$(e.target).focus();
						$(e.target).select();
					});
					
					// DELETE FOR BG
					puzInit.calcCoords();
					
					// Puzzle clues added to DOM in calcCoords(), so now immediately put mouse focus on first clue
					clueLiEls = $('#puzzle-clues li');
					$('#' + currOri + ' li' ).eq(0).addClass('clues-active').focus();
				
					// DELETE FOR BG
					puzInit.buildTable();
					puzInit.buildEntries();
					// puzInit.showAttempts();
										
				},
				
				/*
					- Given beginning coordinates, calculate all coordinates for entries, puts them into entries array
					- Builds clue markup and puts screen focus on the first one
				*/
				calcCoords: function() {
					/*
						Calculate all puzzle entry coordinates, put into entries array
					*/
					for (var i = 0, p = entryCount; i < p; ++i) {		
						// set up array of coordinates for each problem
						entries.push(i);
						entries[i] = [];

						// VR: replaced answer.length with DevanagriWordLength
						// for (var x=0, j = DevanagriWordLength(puzz.data[i].answer); x < j; ++x) {
						for (var x=0, j = IndicWordLength(puzz.data[i].answer); x < j; ++x) {
							entries[i].push(x);
							coords = puzz.data[i].orientation === 'across' ? "" + puzz.data[i].startx++ + "," + puzz.data[i].starty + "" : "" + puzz.data[i].startx + "," + puzz.data[i].starty++ + "" ;
							entries[i][x] = coords; 
						}

						// while we're in here, add clues to DOM!
						// Original Line
						//$('#' + puzz.data[i].orientation).append('<li tabindex="1" data-position="' + i + '">' + puzz.data[i].clue + '</li>'); 
						$('#' + puzz.data[i].orientation).append('<li tabindex="1" data-position="' + i + '">' + puzz.data[i].position + ". " + puzz.data[i].clue + '</li>');
						
						/*
						if(i===0) {
							z = 1;
						} else {
							z = i;
						}
						$('#' + puzz.data[i].orientation).append('<li value="' + z + '" tabindex="1" data-position="' + i + '">' + puzz.data[i].clue + '</li>');
						*/
					}				
					
					// Calculate rows/cols by finding max coords of each entry, then picking the highest
					for (var i = 0, p = entryCount; i < p; ++i) {
						for (var x=0; x < entries[i].length; x++) {
							cols.push(entries[i][x].split(',')[0]);
							rows.push(entries[i][x].split(',')[1]);
						};
					}

					rows = Math.max.apply(Math, rows) + "";
					cols = Math.max.apply(Math, cols) + "";
		
				},
				
				/*
					Build the table markup
					- adds [data-coords] to each <td> cell
				*/
				buildTable: function() {
					for (var i=1; i <= rows; ++i) {
						tbl.push("<tr>");
							for (var x=1; x <= cols; ++x) {
								tbl.push('<td data-coords="' + x + ',' + i + '"></td>');		
							};
						tbl.push("</tr>");
					};

					tbl.push("</table>");
					puzzEl.append(tbl.join(''));
				},
				
				/*
					Builds entries into table
					- Adds entry class(es) to <td> cells
					- Adds tabindexes to <inputs> 
					- usually tabindex="-1"  means that the element is not reachable via sequential keyboard navigation, but could be focused with JavaScript or visually by clicking with the mouse.
				*/
				buildEntries: function() {
					var puzzCells = $('#puzzle td'),
						light,
						$groupedLights,
						hasOffset = false,
						positionOffset = entryCount - puzz.data[puzz.data.length-1].position; // diff. between total ENTRIES and highest POSITIONS
						
					for (var x=1, p = entryCount; x <= p; ++x) {
						var letters = puzz.data[x-1].answer.split('');

						for (var i=0; i < entries[x-1].length; ++i) {
							// light = $(puzzCells+'[data-coords="' + entries[x-1][i] + '"]');
							// light = $(puzzCells[x] +'[data-coords="' + entries[x-1][i] + '"]');
							light = $('#puzzle td[data-coords="'+entries[x-1][i]+'"]');
							
							// check if POSITION property of the entry on current go-round is same as previous. 
							// If so, it means there's an across & down entry for the position.
							// Therefore you need to subtract the offset when applying the entry class.
							if(x > 1 ){
								if (puzz.data[x-1].position === puzz.data[x-2].position) {
									hasOffset = true;
								};
							}
							
							// VR changed: commented: maxlength from 1 to 5 to accept multi-byte Devanagri characters.
							// VR changed: Removed maxlength="1" to accomodate multi-byte Indian Languages Script characters.
							if($(light).empty()){
								$(light)
									// .addClass('entry-' + (hasOffset ? x - positionOffset : x) + ' position-' + (x-1) )
									.addClass('entry-' + x + ' position-' + (x-1) )
									/*.append('<input maxlength="5" val="" type="text" tabindex="-1" />');*/
									.append('<input val="" type="text" tabindex="-1" />');
							}
						};
						
					};	
					
					// Put entry number in first 'light' of each entry, skipping it if already present
					for (var i=1, p = entryCount; i < p; ++i) {
						$groupedLights = $('.entry-' + i);
						// VR: select first .entry-i element
						if(!$('.entry-' + i +':eq(0) span').length){
							// add span tag to the 0th index/ first element
							// VR: changed puzz.data[i] to puzz.data[i-1] to fix mismatch between clue position and td position
							// the reason/ root cause for this is .entry-i class number starts with 1. 
							$groupedLights.eq(0)
								.append('<span>' + puzz.data[i-1].position + '</span>');
						}
					}	
					
					util.highlightEntry();
					util.highlightClue();
					$('.active').eq(0).focus();
					$('.active').eq(0).select();
										
				},
				/* 
					it'll fill in the user's attempts. 
				*/
				showAttempts: function() {
    
					//console.log("entries",entries);		// co-ords of cell - col,row, ["1,1", "2,1", "3,1", "4,1"]
				
					for (var x=1, p = entryCount; x <= p; ++x) {
						//var letters = puzz.data[x-1].answer.split('');
						var attempt = puzz.data[x-1].attempt.split('');		// retrieved user's attempt - useful when rebuilding puzzle with user attempts
						console.log(attempt);
				
						console.log("entries["+(x-1)+"]",entries[x-1]);		// co-ords of cell - col,row, ["1,1", "2,1", "3,1", "4,1"]
				
						var y = 0;
						for (var i=0; i < entries[x-1].length; ++i) {
							var selector =  '.position-' + (x-1) + ' input';
							//console.log(selector);
							
							var co = entries[x-1][i].split(",");
							console.log("co:",co);
				
							var c0 = co[0];
							var c1 = co[1];
							var r = 0;
							if(c0>=c1) {
								r = c0;
								// try to normalise what we have
								// col value appears first, and 
								// has the column value of the <td> element across the row
								// to target it properly, if it's at say, col 6 (and its the 1st letter position of the word),
								// we need to force it back to 1
								var t1 = r;		// could be 6
								var t2 = t1 - 1;	// whatever value is one less ie: 5
								var t3 = (t1 - t2) + y;	// ie: 6 - 5 = 1
								y++;
								r = t3;
															
							} else {
								r = co[1];
							}
				
							console.log("r:",r,"t1:",t1, "t2:",t2, "t3:",t3,"attempt[r-1]",attempt[r-1],"attempt[t3-1]",attempt[t3-1]);	
				
								
								$(selector)[r-1].value = attempt[r-1];
							
						}

						// var attempt = puzz.data[x-1].attempt.split('');		// retrieved user's attempt - useful when rebuilding puzzle with user attempts
						console.log(attempt);

					}
				
				},
				
				// to show the solution of currently selected/ active clue
				/* Logic:
					a) derive answer and current entry's orientation in ans, currOrientation resp.
					b) use the same logic already used in showSolution function, which makes use of
					   generator function SplitIndicWord to split the word into grapheme characters/ letters (uses while loop)
					c) then we determine the current entry's First Coordinate inside variable currentFirstCoord
					d) for loop is iterated to the length of active entry
					e) inside loop based on current orientation, x, y and new coordinates are derived into 
						x2Coord, y2Coord and newCoord variables resp.
					f) value from the current element of splittedWord3 is populated into the data-coord attribute of the
						active position

				*/
				getCurrentSoln: function(pastedValue) {
					
					let ans = pastedValue ? 
						pastedValue
						: puzz.data[activePosition].answer.toLowerCase();
					let currOrientation = puzz.data[activePosition].orientation;

					let splittedWord3 = [];
							
					let a3 = SplitIndicWord(ans)
					res3 = {}
					while (!res3.done) {
						res3 = a3.next();
						if (res3.value) {
							splittedWord3.push(res3.value);
							// console.log(res3.value);
						}
					}

					// get the first active input element, then from its parent node get the attribute value (nodeValue). attribute[0] means data-coords
					let currentFirstCoord = $("input.active:first")[0].parentNode.attributes[0].nodeValue;
					// get the last active input element, then from its parent node get the attribute value (nodeValue). attribute[0] means data-coords
					// let currentLastCoord = $("input.active:last")[0].parentNode.attributes[0].nodeValue;

					for(let j = 0; j<$actives.length; j++) {
														
						if (currOrientation === 'across') {
							let x2Coord = parseInt(currentFirstCoord.substr(0, currentFirstCoord.indexOf(','))) + j;
							newCoord = x2Coord + currentFirstCoord.substr(currentFirstCoord.indexOf(','));
						}
						else {
							let y2Coord = parseInt(currentFirstCoord.substr(currentFirstCoord.indexOf(',') + 1)) + j;
							newCoord = currentFirstCoord.substr(0, currentFirstCoord.indexOf(',') + 1) + y2Coord;
						}
						
						$("[data-coords='" + newCoord + "'].position-" + activePosition + " input").val(splittedWord3[j]);
						
					}
					
					// to move to current cell
					$('.active').eq(0).focus();						
										
				},
				/*
					- Checks current entry input group value against answer
					- If not complete, auto-selects next input for user
				*/
				checkAnswer: function(e) {
					
					var valToCheck, currVal;
					
					util.getActivePositionFromClassGroup($(e.target));
				
					valToCheck = puzz.data[activePosition].answer.toLowerCase();

					// VR: added to remove trailing space
					currVal = $('.position-' + activePosition + ' input')
						.map(function() {
					  		return $(this)
								.val()
								.trim() 
								.toLowerCase();
						})
						.get()
						.join('');
						
					
					console.log(currVal + "|" + valToCheck);
					if(valToCheck === currVal){	
						$('.active')
							.addClass('done')
							.removeClass('active');
					
						$('.clues-active').addClass('clue-done');

						solved.push(valToCheck);
						solvedToggle = true;

						// update the score
						// $("#yourScore").text("Your Score is: " + solved.length + " / " + puzz.data.length).css("color", "green", "font-weight", "bold")
						$("#yourScore").text("Your Score is: " +  $('.clue-done').length + " / " + puzz.data.length).css("color", "green", "font-weight", "bold")
						return;
					}
					
					// VR added: to move to next cell when either Spacebar, Enter key press or  upon five characters
					// if(e.keyCode === 32 || e.keyCode === 13) /*|| e.target.value.length === 5)*/
					if(e.which === 32 || e.which === 13) /*|| e.target.value.length === 5)*/
					{
						currOri === 'across' ? nav.nextPrevNav(e, 39) : nav.nextPrevNav(e, 40);
					}
					//z++;
					//console.log(z);
					//console.log('checkAnswer() solvedToggle: '+solvedToggle);

				},
				
				// ADDED! check the solved array against the original puzzle data entries
				uniqueSolved: function () {
									
					// var uniqSolved  = _.uniq(solved);
					var uniqSolved  = jQuery.unique(solved);
					console.log(uniqSolved);
					var numMatches = 0;
					var numMatchedAll = 0;
					for(var i=0; i < puzz.data.length; i++) {		// look through all entries
						numMatchedAll++;
						for(var a=0; a < solved.length; a++) {
							var puzzItem = puzz.data[i];
							var puzzAnswer = uniqSolved[a];
							if(puzzAnswer === puzzItem.answer) {
								numMatches++;
							}
						}
					};
					if(numMatches === numMatchedAll) {
						console.log("puzzle solved!!!!!!!");
						alert("puzzle solved!!!!!!!");
					} else {
						console.log("not yet ...");
						alert("not yet ...");
					}
				}


			}; // end puzInit object
			

			var nav = {
				
				nextPrevNav: function(e, override) {
					// console.log(e.target);
					var len = $actives.length,
						struck = override ? override : e.which,
						el = $(e.target),
						p = el.parent(),
						ps = el.parents(),
						selector;
				
					util.getActivePositionFromClassGroup(el);
					util.highlightEntry();
					util.highlightClue();
					
					$('.current').removeClass('current');
					
					selector = '.position-' + activePosition + ' input';
					
					// console.log('nextPrevNav activePosition & struck: '+ activePosition + ' '+struck);
						
					// move input focus/select to 'next' input
					switch(struck) {
						case 39:
							p
								.next()
								.find('input')
								.addClass('current')
								.select();

							break;
						
						case 37:
							p
								.prev()
								.find('input')
								.addClass('current')
								.select();

							break;

						case 40:
							ps
								.next('tr')
								.find(selector)
								.addClass('current')
								.select();

							break;

						case 38:
							ps
								.prev('tr')
								.find(selector)
								.addClass('current')
								.select();

							break;

						default:
						break;
					}
															
				},
	
				updateByNav: function(e) {
					var target;
					
					$('.clues-active').removeClass('clues-active');
					$('.active').removeClass('active');
					$('.current').removeClass('current');
					currIndex = 0;

					target = e.target;
					activePosition = $(e.target).data('position');
					
					util.highlightEntry();
					util.highlightClue();
										
					$('.active').eq(0).focus();
					$('.active').eq(0).select();
					$('.active').eq(0).addClass('current');
					
					// store orientation for 'smart' auto-selecting next input
					currOri = $('.clues-active').parent('ol').prop('id');
										
					activeClueIndex = $(clueLiEls).index(e.target);
					// console.log('updateByNav() activeClueIndex: '+activeClueIndex);
					
				},
			
				// Sets activePosition var and adds active class to current entry
				updateByEntry: function(e, next) {
					var classes, next, clue, e1Ori, e2Ori, e1Cell, e2Cell;
					
					if(e.keyCode === 9 || next){
						// handle tabbing through problems, which keys off clues and requires different handling		
						activeClueIndex = activeClueIndex === clueLiEls.length-1 ? 0 : ++activeClueIndex;
					
						$('.clues-active').removeClass('.clues-active');
												
						next = $(clueLiEls[activeClueIndex]);
						currOri = next.parent().prop('id');
						activePosition = $(next).data('position');
												
						// skips over already-solved problems
						util.getSkips(activeClueIndex);
						activePosition = $(clueLiEls[activeClueIndex]).data('position');
						
																								
					} else {
						activeClueIndex = activeClueIndex === clueLiEls.length-1 ? 0 : ++activeClueIndex;
					
						util.getActivePositionFromClassGroup(e.target);
						
						clue = $(clueLiEls + '[data-position=' + activePosition + ']');
						activeClueIndex = $(clueLiEls).index(clue);
						
						currOri = clue.parent().prop('id');
						
					}
						
						util.highlightEntry();
						util.highlightClue();

						$('.active').eq(0).focus();
						$('.active').eq(0).select();
						
						//$actives.eq(0).addClass('current');	
						// console.log('nav.updateByEntry() reports activePosition as: '+activePosition);	
				}
				
			}; // end nav object

			
			var util = {
				highlightEntry: function() {
					// this routine needs to be smarter because it doesn't need to fire every time, only
					// when activePosition changes
					$actives = $('.active');
					$actives.removeClass('active');
					$actives = $('.position-' + activePosition + ' input').addClass('active');
					/*$actives.eq(0).focus();
					$actives.eq(0).select();*/
				},
				
				highlightClue: function() {
					var clue;				
					$('.clues-active').removeClass('clues-active');
					$(clueLiEls + '[data-position=' + activePosition + ']').addClass('clues-active');
					
					if (mode === 'interacting') {
						clue = $(clueLiEls + '[data-position=' + activePosition + ']');
						activeClueIndex = $(clueLiEls).index(clue);
					};
				},
				
				getClasses: function(light, type) {
					if (!light.length) return false;
					
					var classes = $(light).prop('class').split(' '),
					classLen = classes.length,
					positions = []; 

					// pluck out just the position classes
					for(var i=0; i < classLen; ++i){
						if (!classes[i].indexOf(type) ) {
							positions.push(classes[i]);
						}
					}
					
					return positions;
				},

				getActivePositionFromClassGroup: function(el){

						classes = util.getClasses($(el).parent(), 'position');

						if(classes.length > 1){
							// get orientation for each reported position
							e1Ori = $(clueLiEls + '[data-position=' + classes[0].split('-')[1] + ']').parent().prop('id');
							e2Ori = $(clueLiEls + '[data-position=' + classes[1].split('-')[1] + ']').parent().prop('id');

							// test if clicked input is first in series. If so, and it intersects with
							// entry of opposite orientation, switch to select this one instead
							e1Cell = $('.position-' + classes[0].split('-')[1] + ' input').index(el);
							e2Cell = $('.position-' + classes[1].split('-')[1] + ' input').index(el);

							if(mode === "setting ui"){
								currOri = e1Cell === 0 ? e1Ori : e2Ori; // change orientation if cell clicked was first in a entry of opposite direction
							}

							if(e1Ori === currOri){
								activePosition = classes[0].split('-')[1];		
							} else if(e2Ori === currOri){
								activePosition = classes[1].split('-')[1];
							}
						} else {
							activePosition = classes[0].split('-')[1];						
						}
						
						// console.log('getActivePositionFromClassGroup activePosition: '+activePosition);
						
				},
				
				checkSolved: function(valToCheck) {
					for (var i=0, s=solved.length; i < s; i++) {
						if(valToCheck === solved[i]){
							return true;
						}

					}
				},
				
				getSkips: function(position) {
					if ($(clueLiEls[position]).hasClass('clue-done')){
						activeClueIndex = position === clueLiEls.length-1 ? 0 : ++activeClueIndex;
						util.getSkips(activeClueIndex);						
					} else {
						return false;
					}
				}

								
			}; // end util object

				
			puzInit.init();


			// showSolution: function(myChoice){
			// let showSolution = function(myChoice){
				function showSolution(myChoice) {
		
						// get the first active input element, then from its parent node get the attribute value (nodeValue). attribute[0] means data-coords
						let currentFirstCoord = $("input.active:first")[0].parentNode.attributes[0].nodeValue;
						// get the last active input element, then from its parent node get the attribute value (nodeValue). attribute[0] means data-coords
						let currentLastCoord = $("input.active:last")[0].parentNode.attributes[0].nodeValue;

						for(let i = 0; i<puzz.data.length; i++){
							// console.log($("td").hasClass('position-' + i));
							
		
							let word = puzz.data[i].answer;
							let splittedWord = [];
							
							// let a2 = SplitDevanagriWord(word)
							let a2 = SplitIndicWord(word)
							res2 = {}
							while (!res2.done) {
								res2 = a2.next();
								if (res2.value) {
									splittedWord.push(res2.value);
									// console.log(res2.value);
								}
							}
							// console.log(splittedWord);
							let firstCoord = $(".position-" + i).attr('data-coords');
		
							// VR: changed word.length to DevanagriWordLength(word)
							// dwordLength = DevanagriWordLength(word);
							dwordLength = IndicWordLength(word);
							for(let j = 0; j < dwordLength; j++){
								let newCoord;
								// xCoord: represents column, whereas yCoord: represents row
								if (puzz.data[i].orientation === 'across'){
									let xCoord = parseInt(firstCoord.substr(0, firstCoord.indexOf(','))) + j;
									newCoord = xCoord + firstCoord.substr(firstCoord.indexOf(','));
								}
								else {
									let yCoord = parseInt(firstCoord.substr(firstCoord.indexOf(',') + 1)) + j;
									newCoord = firstCoord.substr(0, firstCoord.indexOf(',') + 1) + yCoord;
								}
		
								// $("[data-coords='" + newCoord + "'].position-" + i + " input").val(word.substr(j, 1));
								// $("[data-coords='" + newCoord + "'].position-" + i + " input").val(splittedWord[j]);
		
								
								switch(myChoice) 
								{
																
									
									case "LAST_CURRENT":
										if (newCoord == currentLastCoord) {
											$("[data-coords='" + newCoord + "'].position-" + i + " input").val(splittedWord[j]);
										} 
										break;
									case "FIRST_CURRENT":
										if (newCoord == currentFirstCoord) {
											$("[data-coords='" + newCoord + "'].position-" + i + " input").val(splittedWord[j]);
										} 
										break;
									case "FULL_SOLUTION":
										$("[data-coords='" + newCoord + "'].position-" + i + " input").val(splittedWord[j]);
										break;
									case "FIRST":
										if (j==0) {
											$("[data-coords='" + newCoord + "'].position-" + i + " input").val(splittedWord[j]);
										}
										break;
									case "LAST":
										if (j==dwordLength-1) {
											$("[data-coords='" + newCoord + "'].position-" + i + " input").val(splittedWord[j]);
										}
										break;
									default:
										void(0);
								}
							}
						}
						// topFunction();
						// to move to current cell last or first cell
						if (myChoice == 'LAST_CURRENT') {
							$('.active').eq($actives.length-1).focus();	
						} else {
							$('.active').eq(0).focus();	
						}
		
			}
			
			
			$("#showCurrentSoln").click(function(){
				puzInit.getCurrentSoln();
			});

			$("#showFullSoln").click(function(){
				showSolution('FULL_SOLUTION');
			});

			$("#showSolnFirstLetter").click(function(){
				showSolution('FIRST');
			});

			$("#showSolnFirstLetterCurrent").click(function(){
				showSolution('FIRST_CURRENT');
			});

			$("#showSolnLastLetter").click(function(){
				showSolution('LAST');
			});

			$("#showSolnLastLetterCurrent").click(function(){
				showSolution('LAST_CURRENT');
			});

			$("#uniqueSolved").click(function(){
				puzInit.uniqueSolved();
			});
	}
});