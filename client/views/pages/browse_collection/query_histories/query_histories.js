/**
 * Created by RSercan on 24.2.2016.
 */
Template.queryHistories.onRendered(function () {
    if (Session.get(Template.strSessionCollectionNames) == undefined) {
        Router.go('databaseStats');
        return;
    }

    Template.queryHistories.initQueryHistories();

    var selector = $('#tblQueryHistories');
    selector.find('tbody').on('click', 'tr', function () {
        var table = selector.DataTable();

        if ($(this).hasClass('selected')) {
            $(this).removeClass('selected');
        }
        else {
            table.$('tr.selected').removeClass('selected');
            $(this).addClass('selected');
        }

        if (table.row(this).data()) {
            Session.set(Template.strSessionSelectedQueryHistory, table.row(this).data());
            $('#btnExecuteAgain').prop('disabled', false);
        }
    });
});

Template.queryHistories.initQueryHistories = function () {
    // loading button
    var l = $('#btnReloadFiles').ladda();
    l.ladda('start');

    var connectionId = Session.get(Template.strSessionConnection);
    var selectedCollection = Session.get(Template.strSessionSelectedCollection);
    var tblQueryHistories = $('#tblQueryHistories');
    // destroy jquery datatable to prevent reinitialization (https://datatables.net/manual/tech-notes/3)
    if ($.fn.dataTable.isDataTable('#tblQueryHistories')) {
        tblQueryHistories.DataTable().destroy();
    }

    var queryHistories = QueryHistory.find({connectionId: connectionId, collectionName: selectedCollection}).fetch();
    tblQueryHistories.DataTable({
        lengthMenu: [3, 5, 10, 20],
        data: queryHistories,
        columns: [
            {data: "queryName", "width": "50%"},
            {data: "date", "width": "20%"},
            {data: "params", "width": "30%"}
        ]
    });

    Ladda.stopAll();
};