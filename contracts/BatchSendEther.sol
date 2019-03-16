// 1 Send it ether
// 2 upload to rinkeby ethscan
// 3 

pragma solidity ^0.5.0;

contract BatchSendEther {
  function () external payable {  }
  mapping (address => bool) public hasUserGottenEther; 

  function batchSendEth(address payable[] calldata users) external {
    require(msg.sender == 0x667dEb5A98f77052cf561658575cF1530Ee42C7a);

    for (uint i = 0; i < users.length; i++) {
      address payable user = users[i];
      if (hasUserGottenEther[user]) continue;
      hasUserGottenEther[user] = users[i].send(.05 ether);
    }
  }
}
