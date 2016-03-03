         $(function() {
            $('.pointslocal-secure-autofill-venue').on('change keyup keydown', function(e) {
              var keyCode = e.keyCode || e.which;
              var currentVenue = $(this).val();
              if (keyCode == 8 || keyCode == 32 || keyCode == 222 || (keyCode >= 35 && keyCode <= 90) && currentVenue.length > 3) {
                var search = encodeURIComponent(currentVenue);
                $.getJSON('http://events.accessatlanta.com/api/v1/venues?search='+search+'&callback=?',function(d) {
                  var suggestions = '';
                  $(d.items).each(function() {
                    suggestions += '<li data-id="'+this.id+'" onclick="updateVenue(this);"><i class="material-icons">place</i> <span class="name">'+this.name+'</span></li>';
                  });
                  $('#pointslocal-secure-event-venue-suggestions').html(suggestions);
                  if (d.items.length < 1) {
                    $('#pointslocal-secure-event-venue-suggestions').html('<li onclick="newVenue()"><a>Can\'t Find Your Venue?</a></li>');
                  }
                  $('#pointslocal-secure-event-venue-suggestions').slideDown();
                });
              }
            });
          });
          function newVenue() {
            $('#pointslocal-secure-event-venue-suggestions').html('');
            $('#pointslocal-secure-event-venue-suggestions').slideUp();
            $('#pointslocal-secure-event-venue-details').slideDown();
          }
          function updateVenue(el) {
            var id = el.getAttribute('data-id');
            var name = $(el).find('.name').text();
            $('.pointslocal-secure-autofill-venue').val(name);
            $('#event_venue_id').val(id);
            $('#pointslocal-secure-event-venue-suggestions').slideUp();
          }
          function findAncestor (el, cls) {
              while ((el = el.parentElement) && !el.classList.contains(cls));
              return el;
          }
          function updatePreviews(el,type, dest) {
            var previewVal = '';
            if (type === 'select') {
              previewVal = el.options[el.selectedIndex].innerHTML;
              console.log(previewVal);
            } else if (type === 'text') {
              previewVal = el.value;
            } else if (type === 'textarea') {
              previewVal = el.value;
            }
            var nodes = document.querySelectorAll(dest);
            for (var i = 0; i < nodes.length; i ++) {
              nodes[i].innerHTML = previewVal;
            }
            
          }
          function addDate(el,init,cb) {

            var model = document.querySelector('#dateModel .dateModelHTML');
            var dateModel = model.cloneNode(true);
            var dateModelUp = dateModel.querySelectorAll('.is-upgraded');
            var dateModelUp2 = dateModel.querySelectorAll('[data-upgraded]');
            for (var i = 0; i < dateModelUp.length; i++) {
              dateModelUp[i].className = dateModelUp[i].className.replace(/is-upgraded/,'');
            }
            for (var i = 0; i < dateModelUp2.length; i++) {
              dateModelUp2[i].removeAttribute('data-upgraded');
            }
            var rcpt = document.querySelector(el);
            if (init) {
              dateModel.querySelector('.pointslocal-secure-step-delete').innerHTML = '';
            }
            rcpt.appendChild(dateModel)
            componentHandler.upgradeDom();
            componentHandler.upgradeAllRegistered();
            var picker;

            $('.pointslocal-secure-step-datepicker').pickadate({
              min: new Date(),
              onSet: function(context) {
                if (cb) {
                  cb();
                }
                window.setTimeout(function() {
                  $('.mdl-textfield').each(function() {
                    this.MaterialTextfield.change($(this).find('.mdl-textfield__input').val());
                  });
                }, 10);
              }
            });
            $('.pointslocal-secure-step-timepicker').pickatime({
              onSet: function(context) {
                window.setTimeout(function() {
                  $('.mdl-textfield').each(function() {
                    this.MaterialTextfield.change($(this).find('.mdl-textfield__input').val());
                  });
                }, 10);
              }
            });

          }

          function dismissToast() {

          }

          function validate(step) {
            return true;
            var errors = [];
            var items = document.querySelectorAll('#pointslocal-secure-create-step'+step+' .pointslocal-secure-step-validate');
            for(var i = 0; i < items.length; i++) {
              var validateType = items[i].getAttributeNode('data-validate-type').value;
              var validateName = items[i].getAttributeNode('data-validate-description').value;
              var value = items[i].value;
              switch(validateType) {
                case 'has:value':
                  console.log(value);
                  if (!value || value === '') {
                    errors.push(validateName);
                  }
                break;
                case 'not:value':
                  var validateValue = items[i].getAttributeNode('data-validate-value').value;
                  if (value == validateValue) {
                    errors.push(validateName);
                  }

              }
            }
            if (errors.length > 0) {
              var notification = document.querySelector('.mdl-js-snackbar');
              var data = {
                message: 'Please check the following fields for errors: '+errors.join(','),
                actionHandler: function(event) {dismissToast();},
                actionText: 'OK',
                timeout: 3000
              };
              notification.MaterialSnackbar.showSnackbar(data);
              return false;
            } else {
              return true;
            }

          }

          var submissionStep = 0;
          function stepIncrement(dir,init) {
            if (init === true) {
              if (validate(submissionStep)) {

              } else {
                return false;
              }
            }
            if (dir === -1) {
              submissionStep--;
            } else {
              submissionStep++;
            }

            var steps = document.getElementsByClassName('pointslocal-secure-create-step');
            if (submissionStep > steps.length || submissionStep < 1) {
              submissionStep = 1;
            }
            if (submissionStep === steps.length) {
              $('.pointslocal-secure-create-step-next').attr("disabled","disabled");
            } else {
              $('.pointslocal-secure-create-step-next').removeAttr('disabled');
            }
            if (submissionStep === 1) {
              $('.pointslocal-secure-create-step-prev').attr("disabled","disabled");
            } else {
              $('.pointslocal-secure-create-step-prev').removeAttr('disabled');
            }
            var target = 'pointslocal-secure-create-step'+submissionStep;

            for (var i = 0; i < steps.length; i++ ) {
              steps[i].style.display = 'none';
              var descID = 'pointslocal-step-description'+(i+1);
              var el = document.getElementById(descID);
              if (i < submissionStep) {
                el.classList.add('active');
              } else {
                el.classList.remove('active');
              }
            }
            document.getElementById(target).style.display = 'block';
          }
          function compileForm() {
            var dates = [];
            $('#pointslocal-secure-create-date-container .dateModelHTML').each(function() {
              var date = { date: $(this).find('.pointslocal-secure-step-datepicker').val(), stime: $(this).find('.pointslocal-secure-step-start-time').val(), etime: $(this).find('.pointslocal-secure-step-end-time').val() }
              dates.push(date);
            });
            $('#date_info').val(JSON.stringify(dates));
            $('.pointslocal-secure-form').submit();
          }

          function compileCheckoutAmount() {
            var totalDates = 0;
            $('.pointslocal-secure-step-datepicker').each(function() {
              if ($(this).val()) {
                totalDates++;
              }
            });
            var totalAmount =  (_UPGRADE_RATE * totalDates).toFixed(2) ;
            $('.pointslocal-secure-upgrade-days').text(totalDates.toFixed(2));
            $('.pointslocal-secure-upgrade-total').text(totalAmount);
          }