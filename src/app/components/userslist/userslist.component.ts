import { Component, ElementRef, ViewChild } from '@angular/core';
import { User } from 'src/app/interfaces/user.interface';
import { MatDialog } from '@angular/material/dialog';
import { SignallingService } from 'src/app/services/signalling.service';
import { PeerService } from 'src/app/services/peer.service';
import { Router } from '@angular/router';
import { CallData } from 'src/app/interfaces/callData.interface';
import { CallNotificationComponent } from '../call-notification/call-notification.component';
import { AuthService } from 'src/app/services/auth.service';

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
  showAllUsers = false;
  private readonly allUserKey = 'allUsers';
  
constructor(
  private authService : AuthService,
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
  console.log(this.allUsers)
  this.signalingService.listenForFriendsListUpdate().subscribe((newFriend: User) => {
    this.friendsList!.push(newFriend); 
  });
  
}

toggleAllUsers() {
  this.showAllUsers = !this.showAllUsers;
}


sendFriendRequest(selectedPeerId: string): void{
  console.log(selectedPeerId)
  this.signalingService.emitFriendRequest(selectedPeerId)
  this.peerService.connectToPeer(selectedPeerId)

}

selectUserForChat(user: User){
  const selectedUserPeerId = user.peerId
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
