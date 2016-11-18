/**
 * Created by sercan on 17.11.2016.
 */
(function () {
    let warnedAlready = false;

    const warn = function () {
        if (!warnedAlready) {
            $('.query-wizard .content').append($('<div class="left"><div class="author-name">Mongoclient </div> <div class="chat-message active">Please select an option, so that I can help you !</div></div>'));
            warnedAlready = true;
        }
    };

    QueryWizardChat.prototype = {
        respond(){
            let val = this.cmb.val();
            if (!val) {
                warn();
                return;
            }



            this.warnedAlready = false;
        },
    };


    export default QueryWizardChat;
})();