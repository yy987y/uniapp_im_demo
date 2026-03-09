# V2 API Interface List

## Table of Contents
- [V2NIMLoginService](#v2nimloginservice)
- [V2NIMMessageService](#v2nimmessageservice)
- [V2NIMConversationService](#v2nimconversationservice)
- [V2NIMTeamService](#v2nimteamservice)
- [V2NIMFriendService](#v2nimfriendservice)
- [V2NIMUserService](#v2nimuserservice)
- [V2NIMSettingService](#v2nimsettingservice)
- [V2NIMStorageService](#v2nimstorageservice)
- [V2NIMSignallingService](#v2nimsignallingservice)
- [V2NIMAIService](#v2nimaiservice)
- [V2NIMNotificationService](#v2nimnotificationservice)

## V2NIMLoginService

| Method | Parameters | Return |
|--------|------------|--------|
| login | accountId, token, loginOption? | Promise<void> |
| logout | - | Promise<void> |
| getLoginUser | - | string |
| getLoginStatus | - | number (0:logout, 1:loggedIn, 2:loggingIn, 3:backoff) |
| getConnectStatus | - | number (0:disconnected, 1:connected, 2:connecting, 3:waiting) |
| getCurrentLoginClient | - | V2NIMLoginClient |
| getLoginClients | - | V2NIMLoginClient[] |
| kickOffline | client | Promise<void> |
| getKickedOfflineDetail | - | V2NIMKickedOfflineDetail |
| getDataSync | - | V2NIMDataSyncState |

### Events
- onLoginStatus, onLoginFailed, onKickedOffline, onLoginClientChanged
- onConnectStatus, onDisconnected, onConnectFailed, onDataSync

## V2NIMMessageService

| Method | Parameters |
|--------|------------|
| sendMessage | message, conversationId, params? |
| replyMessage | message, replyMessage |
| revokeMessage | message, revokeParams? |
| deleteMessage | message, serverExtension? |
| getMessageList | option |
| getMessageListByRefers | messageRefers |
| clearHistoryMessage | option |
| sendP2PMessageReceipt | message |
| getP2PMessageReceipt | conversationId |
| sendTeamMessageReceipts | messages |
| pinMessage | message, serverExtension? |
| unpinMessage | messageRefer, serverExtension? |
| getPinnedMessageList | conversationId |
| addQuickComment | message, index, serverExtension? |
| removeQuickComment | messageRefer, index, serverExtension? |
| getQuickCommentList | messageRefers |
| addCollection | params |
| removeCollections | collections |
| getCollectionListByOption | option |

### Message Creator
```javascript
nim.V2NIMMessageCreator.createTextMessage(text)
nim.V2NIMMessageCreator.createImageMessage(...)
nim.V2NIMMessageCreator.createAudioMessage(...)
nim.V2NIMMessageCreator.createVideoMessage(...)
nim.V2NIMMessageCreator.createFileMessage(...)
nim.V2NIMMessageCreator.createLocationMessage(...)
nim.V2NIMMessageCreator.createCustomMessage(...)
nim.V2NIMMessageCreator.createTipsMessage(...)
nim.V2NIMMessageCreator.createForwardMessage(...)
```

## V2NIMConversationService

| Method | Parameters |
|--------|------------|
| getConversationList | offset, limit |
| getConversation | conversationId |
| getConversationListByIds | conversationIds |
| createConversation | conversationId |
| deleteConversation | conversationId, clearMessage? |
| stickTopConversation | conversationId, stickTop |
| updateConversation | conversationId, updateInfo |
| getTotalUnreadCount | - |
| getUnreadCountByIds | conversationIds |
| clearTotalUnreadCount | - |
| clearUnreadCountByIds | conversationIds |

### ConversationId Utils
```javascript
nim.V2NIMConversationIdUtil.p2pConversationId(accountId)
nim.V2NIMConversationIdUtil.teamConversationId(teamId)
nim.V2NIMConversationIdUtil.superTeamConversationId(teamId)
nim.V2NIMConversationIdUtil.parseConversationType(conversationId)
nim.V2NIMConversationIdUtil.parseConversationTargetId(conversationId)
```

## V2NIMTeamService

| Method | Parameters |
|--------|------------|
| createTeam | createTeamParams, inviteeAccountIds?, postscript? |
| updateTeamInfo | teamId, teamType, updateParams |
| dismissTeam | teamId, teamType |
| leaveTeam | teamId, teamType |
| getTeamInfo | teamId, teamType |
| getTeamInfoByIds | teamIds, teamType |
| getJoinedTeamList | teamTypes? |
| getJoinedTeamCount | teamTypes? |
| inviteMember | teamId, teamType, inviteeAccountIds, postscript? |
| kickMember | teamId, teamType, memberAccountIds |
| applyJoinTeam | teamId, teamType, postscript? |
| acceptInvitation | invitationInfo |
| rejectInvitation | invitationInfo, postscript? |
| getTeamMemberList | teamId, teamType, queryOption |
| getTeamMemberByIds | teamId, teamType, accountIds |
| updateSelfTeamMemberInfo | teamId, teamType, memberInfo |
| setTeamChatBannedMode | teamId, teamType, chatBannedMode |
| setTeamMemberChatBannedStatus | teamId, teamType, accountId, chatBanned |

### Team Types
- 0: Advanced Team
- 1: Normal Team

## V2NIMFriendService

| Method | Parameters |
|--------|------------|
| addFriend | accountId, params |
| deleteFriend | accountId, params? |
| acceptAddApplication | application |
| rejectAddApplication | application, postscript? |
| setFriendInfo | accountId, params |
| getFriendList | - |
| getFriendByIds | accountIds |
| checkFriend | accountIds |
| searchFriendByOption | option |
| getAddApplicationList | option |
| getAddApplicationUnreadCount | - |
| setAddApplicationRead | - |
| deleteAddApplication | application |
| clearAllAddApplication | - |

### Add Mode
- 1: Direct add
- 2: Request add (needs approval)

## V2NIMUserService

| Method | Parameters |
|--------|------------|
| getUserList | accountIds |
| getUserListFromCloud | accountIds |
| updateSelfUserProfile | params |
| searchUserByOption | option |
| addUserToBlockList | accountId |
| removeUserFromBlockList | accountId |
| getBlockList | - |
| checkBlock | accountIds |

### Profile Fields
name, avatar, sign, email, birthday, mobile, gender, serverExtension

## V2NIMSettingService

| Method | Parameters |
|--------|------------|
| getP2PMessageMuteMode | accountId |
| setP2PMessageMuteMode | accountId, muteMode |
| getTeamMessageMuteMode | teamId, teamType |
| setTeamMessageMuteMode | teamId, teamType, muteMode |
| getP2PMessageMuteList | - |
| getDndConfig | - |
| setDndConfig | config |
| setPushMobileOnDesktopOnline | enable |

## V2NIMStorageService

| Method | Parameters |
|--------|------------|
| uploadFile | params |
| getImageThumbUrl | url, thumbSize |
| getVideoCoverUrl | url, offset? |
| shortUrlToLong | shortUrl |

## V2NIMSignallingService

| Method | Parameters |
|--------|------------|
| createRoom | params |
| closeRoom | channelId |
| joinRoom | params |
| leaveRoom | channelId |
| invite | params |
| cancelInvite | params |
| acceptInvite | params |
| rejectInvite | params |
| call | params |
| sendControl | params |

### Channel Types
- 1: Audio
- 2: Video
- 3: Custom

## V2NIMAIService

| Method | Parameters |
|--------|------------|
| getAIUserList | - |
| proxyAIModelCall | params |

## V2NIMNotificationService

| Method | Parameters |
|--------|------------|
| sendCustomNotification | conversationId, content, params? |

### Events
- onReceiveCustomNotifications
