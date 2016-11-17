/**
 * Created by sercan on 17.11.2016.
 */
(function () {

    let collectionObj = {
        "Would you mind picking a collection (table) name to proceed?": "COLLECTIONS"
    };
    let conversation = {
        "Create": {
            "Here're the options for data creation in mongodb.": [
                {
                    "insertMany": collectionObj,
                },
                {
                    "bulkWrite": collectionObj
                }
            ]
        },
        "Read": {
            "Usually 'find' query is way to go here if you don't know what to select (find = select)": [
                {
                    "count": collectionObj,
                },
                {
                    "distinct": collectionObj,
                },
                {
                    "find": collectionObj,
                },
                {
                    "findOne": collectionObj
                }
            ]
        },
        "Update": {
            "There're a few ways to update a document (row) in mongodb, choose 'updateOne' if you don't know what to select": [
                {
                    "findOneAndUpdate": collectionObj,
                },
                {
                    "findOneAndReplace": collectionObj,
                },
                {
                    "updateMany": collectionObj,
                },
                {
                    "updateOne": collectionObj
                }
            ]
        },
        "Delete": {
            "Delete can be dangerous, try 'findOneAndDelete' if you're new, so you can delete only one row if something goes wrong.": [
                {
                    "findOneAndDelete": collectionObj,
                },
                {
                    "delete": collectionObj
                }
            ]
        },
        "Warn": "Please select an option, otherwise I can't help you !"
    };

    let warnedAlready = false;

    let QueryWizardChat = function (cmb) {
        this.cmb = cmb;

        $.each(conversation, (key, value) => {
            var option = $("<option></option>")
                .attr("value", key)
                .text(key);
            this.cmb.append(option);
        });

        this.cmb.chosen();
    };

    const warn = function () {
        if (!warnedAlready) {
            $('.query-wizard .content').append($('<div class="left"><div class="author-name">Mongoclient </div> <div class="chat-message active">Please select an option, so that I can help you !</div></div>'));
            warnedAlready = true;
        }
    };

    const getValueOfObjectKey = function (requestedKey) {
        for (var key in conversation) {
            if (conversation.hasOwnProperty(key)) {
                if (requestedKey === key) {
                    return conversation[key];
                } else if (Object.prototype.toString.call(conversation[key]) === '[object Array]' || Object.prototype.toString.call(conversation[key]) === '[object Object]') {
                    return getValueOfObjectKey(conversation[key]);
                }
            }
        }
    };


    QueryWizardChat.prototype = {
        respond(){
            let val = this.cmb.val();
            if (!val) {
                warn();
                return;
            }

            $('.query-wizard .content').append($('<div class="right"><div class="author-name">Me </div> <div class="chat-message">' + val + '</div></div>'));

            getValueOfObjectKey(cmb);

            this.warnedAlready = false;
        },


    };


    export default QueryWizardChat;
})();