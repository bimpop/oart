
// comment edit modal - multiple edit btns to single modal
$('#commentEdit').on('show.bs.modal', function(event){
    var button = $(event.relatedTarget);
    var username = button.data('username');
    var text = button.data('text');
    var art_id = button.data('art');
    var com_id = button.data('com');
    // update the modal content
    var modal = $(this);
    modal.find('.modal-title h5').text('Edit comment by ' + username);
    modal.find('.modal-body textarea').val(text);
    console.log(modal.find('.modal-body form').attr('action'));
    var action_url = '/artworks/'+ art_id + '/comments/' + com_id + '?_method=PUT'
    modal.find('.modal-body form').attr('action', action_url);
});