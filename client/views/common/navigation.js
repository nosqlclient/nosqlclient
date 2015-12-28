Template.navigation.rendered = function () {
    // Initialize metisMenu
    $('#side-menu').metisMenu();
};

Template.navigation.events({
    'click .navCollection': function () {
        var name = this.name;

        $('#listCollectionNames li').each(function (index, li) {
            var liObject = $(li);
            if (liObject[0].innerText.substr(1).trim() == name) {
                liObject.addClass('active');
            } else {
                liObject.removeClass('active');
            }
        });

        Session.set(strSessionSelectedCollection, name);
        $('#divJsonEditor').hide();
        $('#divAceEditor').hide();
    }
});