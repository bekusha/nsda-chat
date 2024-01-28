import { Component, ElementRef, ViewChild } from '@angular/core';
import { User } from '../interfaces/user.interface';
import { MatDialog } from '@angular/material/dialog';
import { SignallingService } from '../signalling.service';
import { PeerService } from '../peer.service';
import { Router } from '@angular/router';
import { CallData } from '../interfaces/callData.interface';
import { CallNotificationComponent } from '../call-notification/call-notification.component';

@Component({
  selector: 'app-userslist',
  templateUrl: './userslist.component.html',
  styleUrls: ['./userslist.component.css']
})
export class UserslistComponent {

  @ViewChild('localVideo') localVideo!: ElementRef;
  @ViewChild('remoteVideo') remoteVideo!: ElementRef;

  public allUsers: User[] | null = []
  public friendsList: User[] | null = []
  localStream!: MediaStream;
  
constructor(
  
  private signalingService: SignallingService,
  private peerService: PeerService,  
  private router : Router,
  private dialog : MatDialog
  
 ){

}
ngOnInit(): void {
  this.signalingService.listen('users-list').subscribe((usersData: User[]) => {
    this.allUsers = usersData;
    console.log('Updated users list:', this.allUsers);
  });

  
  this.signalingService.getFriendsListObservable().subscribe((friendsData: User[]) => {
    this.friendsList = friendsData;
    console.log('Current friends list:', this.friendsList);
  });

  this.signalingService.listenForFriendsListUpdate().subscribe((newFriend: User) => {
    if (this.friendsList && !this.friendsList.find(friend => friend.peerId === newFriend.peerId)) {
      this.friendsList.push(newFriend);
      console.log('Added new friend:', newFriend);
    }
  });
  
}


sendFriendRequest(selectedPeerId: string): void{
  this.signalingService.emitFriendRequest(selectedPeerId)
  this.peerService.connectToPeer(selectedPeerId)

}

selectUserForChat(selectedUserPeerId: string){
  this.router.navigate(['chat'], {queryParams: {peerId: selectedUserPeerId}})
}



openCallDialog(callData: CallData) {
  const dialogRef = this.dialog.open(CallNotificationComponent, {
    width: '350px',
    data: callData
  });

  dialogRef.afterClosed().subscribe(result => {
    console.log('The call dialog was closed');
  
  });
}

async getLocalStream(): Promise<MediaStream> {
  try {
    const stream = await this.peerService.getUserMedia();
    this.localStream = stream;
    
    if (this.localVideo) {
      this.localVideo.nativeElement.srcObject = stream;
      this.localVideo.nativeElement.muted = true;
    }
    return stream;
  } catch (error) {
    console.error('Error getting user media:', error);
    throw error;
  }
}

logout(){

}

}
