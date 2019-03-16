// 1 Send it ether
// 2 upload to rinkeby ethscan
// 3 

pragma solidity ^0.5.0;

contract OilPriceBet {
  string betDescription = "Price of May19 oil futures - https://www.theice.com/products/219/Brent-Crude-Futures/data?marketId=222470";

  // ------------------ Betting
  function placeBet(bool isAbovePrice) external payable {
    address user = msg.sender;
    uint amountBetting = msg.value;
    bool userHasNotBetted = userBet[user] == 0;
    
    require(userHasNotBetted);
    require(amountBetting == .01 ether);

    if (isAbovePrice) userBet[user] = 2;  // Above price
    else              userBet[user] = 1;  // Below price
  }

  function collectWinnings() external {
    address payable user = msg.sender;

    require(userCollectedWinings[user] == false);

    bool userBetAboveStrikePrice = userBet[user] == 2;
    bool userBetNotAboveStrikePrice = userBet[user] == 1;

    bool isAboveStrikePrice = outcomePrice > strikePrice;
    bool isNotAboveStrikePrice = outcomePrice <= strikePrice; 

    userCollectedWinings[user] = true;
    if (userBetAboveStrikePrice && isAboveStrikePrice)       sendEther(user, .02 ether);
    if (userBetNotAboveStrikePrice && isNotAboveStrikePrice) sendEther(user, .02 ether);
  }

  // ------------------ Admin
  function setStrikePrice(uint price) external {
    require(msg.sender == 0x667dEb5A98f77052cf561658575cF1530Ee42C7a);
    require(strikePrice == 0);
    strikePrice = price;
  }

  function setOutcomePrice(uint price) external {
    require(msg.sender == 0x667dEb5A98f77052cf561658575cF1530Ee42C7a);
    require(outcomePrice == 0);
    outcomePrice = price;
  }

  // ------------------ Miscallaneous
  uint public strikePrice;
  uint public outcomePrice;
  mapping (address => uint) public userBet;
  mapping (address => bool) public userCollectedWinings;
  function () payable external {}
  function sendEther(address payable user, uint amount) private { require(user.send(amount)); }
}
