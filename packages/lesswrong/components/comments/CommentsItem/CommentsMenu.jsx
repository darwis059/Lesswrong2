import React, { PureComponent } from 'react';
import { registerComponent, Components } from 'meteor/vulcan:core';
import PropTypes from 'prop-types';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import Menu from '@material-ui/core/Menu';
import Divider from '@material-ui/core/Divider';
import withUser from '../../common/withUser';
import Users from 'meteor/vulcan:users';

import { withStyles } from '@material-ui/core/styles';

const styles = theme => ({
  icon: {
    cursor: "pointer",
    fontSize:"1.4rem"
  },
  menu: {
    position:"absolute",
    right:0,
    top:0,
    zIndex: 1,
  }
})

class CommentsMenu extends PureComponent {
  state = {anchorEl:null}

  handleClick = event => {
    this.setState({ anchorEl: event.currentTarget });
  }

  handleClose = () => {
    this.setState({anchorEl: null})
  }

  render() {
    const { currentUser, children, classes, className, comment, post, showEdit, icon } = this.props
    const { anchorEl } = this.state
    const { EditCommentMenuItem, ReportCommentMenuItem, DeleteCommentMenuItem, RetractCommentMenuItem, BanUserFromPostMenuItem, BanUserFromAllPostsMenuItem, MoveToAlignmentMenuItem, SuggestAlignmentMenuItem, BanUserFromAllPersonalPostsMenuItem, MoveToAnswersMenuItem } = Components
    return (
      <span className={className}>
        <span onClick={this.handleClick}>
          {icon ? icon : <MoreVertIcon
            className={classes.icon}/>}
        </span>
        <Menu
          onClick={this.handleClose}
          open={Boolean(anchorEl)}
          anchorEl={anchorEl}
        >
          <EditCommentMenuItem comment={comment} showEdit={showEdit}/>
          <ReportCommentMenuItem comment={comment}/>
          <MoveToAlignmentMenuItem comment={comment} post={post}/>
          <SuggestAlignmentMenuItem comment={comment} post={post}/>
          { Users.canModeratePost(currentUser, post) && post.user && Users.canModeratePost(post.user, post) && <Divider />}
          <MoveToAnswersMenuItem comment={comment}/>
          <DeleteCommentMenuItem comment={comment} post={post}/>
          <RetractCommentMenuItem comment={comment} pst={post}/>
          <BanUserFromPostMenuItem comment={comment} post={post}/>
          <BanUserFromAllPostsMenuItem comment={comment} post={post}/>
          <BanUserFromAllPersonalPostsMenuItem comment={comment} post={post}/>
          {children}
        </Menu>
      </span>
    )
  }
}

registerComponent('CommentsMenu', CommentsMenu, withStyles(styles, {name:"CommentsMenu"}), withUser)
