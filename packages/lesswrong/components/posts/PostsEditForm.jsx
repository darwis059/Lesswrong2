import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { Components, registerComponent, getFragment, withMessages, withDocument } from 'meteor/vulcan:core';
import { intlShape } from 'meteor/vulcan:i18n';
import { Posts } from '../../lib/collections/posts';
import { withRouter } from 'react-router'
import withUser from '../common/withUser';

class PostsEditForm extends PureComponent {

  render() {
    const { documentId, document, eventForm, currentUser } = this.props;
    const isDraft = document && document.draft;

    return (
      <div className="posts-edit-form">
        <Components.SmartForm
          collection={Posts}
          documentId={documentId}
          mutationFragment={getFragment('LWPostsPage')}
          successCallback={post => {
            this.props.flash({ id: 'posts.edit_success', properties: { title: post.title }, type: 'success'});
            this.props.router.push({pathname: Posts.getPageUrl(post)});
          }}
          eventForm={eventForm}
          removeSuccessCallback={({ documentId, documentTitle }) => {
            // post edit form is being included from a single post, redirect to index
            // note: this.props.params is in the worst case an empty obj (from react-router)
            if (this.props.params._id) {
              this.props.router.push('/');
            }

            this.props.flash({ id: 'posts.delete_success', properties: { title: documentTitle }, type: 'success'});
            // todo: handle events in collection callbacks
            // this.context.events.track("post deleted", {_id: documentId});
          }}
          showRemove={true}
          prefilledProps={{
            moderationStyle: currentUser && currentUser.moderationStyle,
            moderationGuidelinesHtmlBody: currentUser && currentUser.moderationGuidelines 
          }}
          submitLabel={isDraft ? "Publish" : "Publish Changes"}
          repeatErrors
        />
      </div>
    );

  }
}

PostsEditForm.propTypes = {
  closeModal: PropTypes.func,
  flash: PropTypes.func,
}

PostsEditForm.contextTypes = {
  intl: intlShape
}

const documentQuery = {
  collection: Posts,
  queryName: 'PostsEditFormQuery',
  fragmentName: 'LWPostsPage',
  ssr: true
};

registerComponent('PostsEditForm', PostsEditForm,
  [withDocument, documentQuery],
  withMessages, withRouter, withUser);
