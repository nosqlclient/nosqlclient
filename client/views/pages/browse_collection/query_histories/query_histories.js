/**
 * Created by RSercan on 24.2.2016.
 */
Template.queryHistories.onRendered(function () {
    if (Session.get(Template.strSessionCollectionNames) == undefined) {
        Router.go('databaseStats');
        return;
    }

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
            var selectedId = table.row(this).data()._id;
            Session.set(Template.strSessionSelectedQueryHistory, QueryHistory.findOne({_id: selectedId}));
            $('#btnExecuteAgain').prop('disabled', false);
        }
    });
});

Template.queryHistories.events({
    'click #btnExecuteAgain': function (e) {
        e.preventDefault();
        var history = Session.get(Template.strSessionSelectedQueryHistory);
        if (history) {
            Template[history.queryName].executeQuery(JSON.parse(history.params));
        }
    }
});

Template.queryHistories.initQueryHistories = function () {
    // loading button
    var l = $('#btnExecuteAgain').ladda();
    l.ladda('start');

    var connectionId = Session.get(Template.strSessionConnection);
    var selectedCollection = Session.get(Template.strSessionSelectedCollection);
    var tblQueryHistories = $('#tblQueryHistories');

    // destroy jquery datatable to prevent reinitialization (https://datatables.net/manual/tech-notes/3)
    if ($.fn.dataTable.isDataTable('#tblQueryHistories')) {
        tblQueryHistories.DataTable().destroy();
    }

    var queryHistories = QueryHistory.find(
        {
            connectionId: connectionId,
            collectionName: selectedCollection
        },
        {
            sort: {date: -1}
        }).fetch();


    tblQueryHistories.DataTable({
        lengthMenu: [3, 5, 10, 20],
        data: queryHistories,
        autoWidth: false,
        columns: [
            {
                data: "queryName",
                "width": "20%"
            },
            {
                data: "date",
                "width": "20%",
                render: function (cellData) {
                    return moment(cellData).format('YYYY-MM-DD HH:mm:ss');
                }
            },
            {
                data: "params",
                "width": "60%",
                render: function (cellData) {
                    return JSON.stringify(cellData).replace(/\\"/g, '');
                }
            }
        ]
    });

    Ladda.stopAll();
};