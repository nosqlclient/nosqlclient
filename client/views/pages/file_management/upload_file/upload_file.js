/**
 * Created by RSercan on 13.2.2016.
 */
Template.uploadFile.onRendered(function () {
    if (Session.get(Template.strSessionCollectionNames) == undefined) {
        Router.go('databaseStats');
    }
});

Template.uploadFile.events({
    'click #btnUpload': function (e) {
        e.preventDefault();
        var blob = $('#inputFile')[0].files[0];

        if (blob) {
            var l = $('#btnUpload').ladda();
            l.ladda('start');
            var fileReader = new FileReader();
            fileReader.onload = function (file) {
                var connection = Connections.findOne({_id: Session.get(Template.strSessionConnection)});
                Meteor.call('uploadFile', connection, $('#txtBucketName').val(), new Uint8Array(file.target.result), blob.name, function (err, result) {
                    if (err || result.error) {
                        var errorMessage;
                        if (err) {
                            errorMessage = err.message;
                        } else {
                            errorMessage = result.error.message;
                        }
                        if (errorMessage) {
                            toastr.error("Couldn't upload file: " + errorMessage);
                        } else {
                            toastr.error("Couldn't upload file, unknown reason ");
                        }
                    }
                    else {
                        toastr.success('Successfuly uploaded file');
                        Template.fileManagement.initFileInformations();
                    }

                    Ladda.stopAll();
                });
            };
            fileReader.readAsArrayBuffer(blob);
        }
    }
});
