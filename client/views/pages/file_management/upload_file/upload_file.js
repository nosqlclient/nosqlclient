/**
 * Created by RSercan on 13.2.2016.
 */
Template.uploadFile.onRendered(function () {
    if (Session.get(Template.strSessionCollectionNames) == undefined) {
        Router.go('databaseStats');
    }

    // $(":file").filestyle({icon: false, buttonBefore: true});
});

Template.uploadFile.events({
    'click #btnUpload': function (e) {
        e.preventDefault();
        var blob = $('#inputFile')[0].files[0];
        if (blob) {
            swal({
                title: "Additional Information",
                text: "Do you want to add additional information to your file ?",
                type: "info",
                showCancelButton: true,
                confirmButtonColor: "#DD6B55",
                confirmButtonText: "Yes!",
                cancelButtonText: "No"
            }, function (isConfirm) {
                if (!isConfirm) {
                    Template.uploadFile.proceedUploading(blob);
                }
                else {
                    $('#fileInfoModal').modal('show');
                }
            });
        }
    }
});

Template.uploadFile.proceedUploading = function (blob, contentType, metaData, aliases) {
    var l = $('#btnUpload').ladda();
    l.ladda('start');
    var fileReader = new FileReader();
    fileReader.onload = function (file) {
        Meteor.call('uploadFile', Session.get(Template.strSessionConnection), $('#txtBucketName').val(), new Uint8Array(file.target.result), blob.name, contentType, metaData, aliases, function (err, result) {
            if (err || result.error) {
                Template.showMeteorFuncError(err, result, "Couldn't upload file");
            }
            else {
                toastr.success('Successfuly uploaded file');
                Template.fileManagement.initFileInformations();
                Ladda.stopAll();
            }
        });
    };
    fileReader.readAsArrayBuffer(blob);
};
