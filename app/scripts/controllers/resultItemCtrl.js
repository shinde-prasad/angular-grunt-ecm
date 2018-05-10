'use strict';

searchApp.controller('resultItemCtrl', function ($scope, $interval, $filter, communicationService, messageService, ngAudio, $cookieStore, Environment) {
    
    $scope.cs = communicationService;

    $scope.fromDate;
    $scope.toDate;

    $scope.resultData;
    $scope.infoFields;
    $scope.preview;

    $scope.currentURI;
    $scope.currentContentSource;
    $scope.highlights;

    $scope.isLoading            = false;
    $scope.processingDownload   = false;
    $scope.haveAttachments      = false;
    
    delete $scope.audio;

    //$scope.attachmentValues     = [{filename:'something.xml', path:'c/d/e/'},{filename:'second.xml', path:'c/d/e/'}];
    $scope.attachmentValues     = [];

    $scope.getSearchItem = function(uri, contentSource) {

        $scope.isLoading    = true;
        $scope.resultData   = undefined; //Cleared the info and the table
        $scope.infoFields   = undefined; //Cleared the info and the table
        $scope.preview      = undefined; //Cleared the info and the table
        $scope.header      = undefined; //Cleared the info and the table
        $scope.internalLoading = true;
        messageService.resetLocal();
        communicationService.getSearchItem.get({"uri":uri, "contentSource":contentSource}).$promise.
            then(function (res) {
                if (res.preview) {
                    $scope.preview = res.preview;
                }
                var head = uri.split('/');
                $scope.header = head[head.length - 1];

                //Change the event date format to a more readable format
                if(res !== null && res.lists !== null && res.lists.Events !== null)
                angular.forEach(res.lists.Events, function(value) {
                  var temp = value['Event_Date'];
                  temp = $filter('date')(temp, 'yyyy-MM-dd HH:mm');
                  value['Event_Date'] =temp;
                });

                $scope.resultData = res;

                if (res.fields !== null) {
                    var fieldNames = Object.getOwnPropertyNames(res.fields);
                    $scope.infoFields = [fieldNames.length];
                    for (var index = 0; index !== fieldNames.length; index++) {
                        var key = fieldNames[index].replace("_", " ");
                        var value = res.fields[fieldNames[index]];
                        if (value.indexOf(";") > 0) {
                            var values = $.map(value.split(";"), function(v) {
                                return $scope.setHighlightMarkup(v);
                            });
                            value = '<span>' + values.join(";</span><br /><span>") + "</span>";
                        } else {
                            value = $scope.setHighlightMarkup(value);                            
                        }
                        $scope.infoFields[index] = {"key": key,"value": value};
                    }
                }

                if (res.title){
                    $scope.titleName = res.title.name.replace("_", " ");
                    if (res.title.value !== null) {
                        $scope.titleValue = $scope.setHighlightMarkup(res.title.value);
                    }
                    else {
                        $scope.titleValue = null;
                    }
                }

                if (res.fields) {
                    $scope.fromDate = $filter('date')(res.fields.From, "yyyy-MM-dd");
                }
                if (res.fields) {
                    $scope.toDate = $filter('date')(res.fields.To, "yyyy-MM-dd");
                }
                $scope.isLoading    = false;
            });
    };

    $scope.escapeHTML = function (text) {
        var entityMap = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': '&quot;',
            "'": '&#39;',
            "/": '&#x2F;'
        };
        return  text.replace(/[&<>"'\/]/g, function (s) {
            return entityMap[s];
        });
    };

    $scope.setHighlightMarkup    = function (text) {
        var result = text;
        var textExp = "";
        for (var index = 0; index !== $scope.highlights.length;index++) {
            textExp += "|" + $scope.highlights[index];
        }

        result = $scope.escapeHTML(result);

        if (textExp.length > 0){
            var keyText = textExp.substring(1);
            if (keyText.indexOf("*") === -1 && keyText.indexOf("?") === -1 && keyText.indexOf(".") === -1) {
                var exp = new RegExp(textExp.substring(1), 'gi');
                result = result.replace(exp, function myFunction(x) {
                    return "<mark>" + x + "</mark>";
                });
            }
        }

        return result;
    };

    // Download query
    $scope.download = function(){
        $scope.$emit('simpleDownload', $scope.currentURI);
    };

    //Gets the document attachments
    $scope.getAttachments   = function(uri, contentSource){
        $scope.haveAttachments  = false;
        messageService.resetLocal();
        communicationService.getAttachmentsName.get({"uri":uri, "contentSource":contentSource}).$promise.
            then(function(results) {
                $scope.attachmentValues = results;
                //This part will be coded based on the position of the attachments in the modal
                if($scope.attachmentValues.length > 0){
                    $scope.haveAttachments  = true;
                }
            }, function(errResponse) {
                messageService.addError('Get attachments name failed.')(errResponse);
                $scope.responseStatus   = 'Get attachments name failed';
            }
        );
    };

    //Download attachments using the filename, the path and the current document URI
    $scope.downloadAttachment   = function(filename, path){
        $scope.$emit('attachmentDownload', {filename:filename, path:path, currentURI:$scope.currentURI, currentContentSource:$scope.currentContentSource});
    };
    
    $scope.getAudioUri = function() {
        if ($scope.infoFields) {
            var audioFile = $filter('filter')($scope.infoFields, {key: 'Sound'});
            if (audioFile.length > 0) {
                var decoded = $('<textarea />').html(audioFile[0].value).text();
                return Environment.getRestapiHost() + '/restapi/services/document/audio?uri='+ encodeURIComponent(decoded) +'&format=mp3&a=' + encodeURIComponent($cookieStore.get("searchApp_token"));
            }
        }
    };
    
    $scope.loadAudio = function() {
        var uri = $scope.getAudioUri();
        if (uri) {
            $scope.audio = ngAudio.load($scope.getAudioUri());
            $scope.waveFormUri = $scope.getAudioUri().replace('format=mp3', 'format=waveform');
            return $scope.audio;
        }
    };
    
    
    angular.element('#resultModal').on('hide.bs.modal', function() {
        if ($scope.audio) {
            $scope.audio.stop();
            delete $scope.audio; 
        }
        delete $scope.infoFields;        
    });     

    $scope.exitDetails  = function(){
        $scope.preview      = undefined;
        $scope.resultData   = undefined;
        $scope.infoFields   = undefined;
    };

    $scope.$on("documentMeta", function (event, uri, contentSource, highlights) {
        $scope.currentURI           = uri;
        $scope.currentContentSource = contentSource;
        $scope.highlights = highlights;
        $scope.getSearchItem(uri, contentSource);
        $scope.getAttachments(uri, contentSource);
    });
    
    
});

searchApp.filter('secondsToDateTime', function() {
    return function(seconds) {
        var d = new Date(0,0,0,0,0,0,0);
        d.setSeconds(seconds);
        return d;
    };
});
