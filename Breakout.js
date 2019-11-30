class TextButton extends Phaser.GameObjects.Text {

    constructor(scene, x, y, text, style, upgrade, callback) {
        super(scene, x, y, text, style);
        this.upgrade = upgrade;

        let textStyle = {fill:'#FFF'};
        this.currentText = new Phaser.GameObjects.Text(scene,x,y+30,"Current : "+ this.upgrade.value + " "+ this.upgrade.unit,textStyle);
        this.ownedText = new Phaser.GameObjects.Text(scene,x,y+60,"Owned : "+ this.upgrade.owned,textStyle);
        this.costText = new Phaser.GameObjects.Text(scene,x,y+90,"Cost : "+ this.upgrade.cost + " Gold",textStyle);

        scene.container.add(this.ownedText);
        scene.container.add(this.currentText);
        scene.container.add(this.costText);

        console.log(this.upgrade);
        this.setInteractive({useHandCursor: true})
            .on('pointerover', () => this.enterButtonHoverState())
            .on('pointerout', () => this.enterButtonRestState())
            .on('pointerdown', () => this.enterButtonActiveState())
            .on('pointerup', () => {
                callback(upgrade);
            });
        console.log("oui");
    }



    enterButtonHoverState() {
        this.setStyle({fill: '#ff0'});
    }

    enterButtonRestState() {
        this.setStyle({fill: '#0f0'});
    }

    enterButtonActiveState() {
        this.setStyle({fill: '#0ff'});
    }

    refresh(){
        this.currentText.setText("Current : "+ this.upgrade.value.toFixed(2) + " "+ this.upgrade.unit);
        this.ownedText.setText("Owned : "+ this.upgrade.owned);
        this.costText.setText("Cost : "+ this.upgrade.cost.toFixed(2) + " Gold");
    }
}

let Breakout = new Phaser.Class({

    Extends: Phaser.Scene,

    initialize:

        function Breakout ()
        {
            Phaser.Scene.call(this, { key: 'breakout' });
        },

    preload: function ()
    {
        this.load.atlas('assets', './assets/breakoutedit.png', './assets/breakout.json');
        this.load.image('shopWall','./assets/breakoutShopWall.png');
    },

    create: function ()
    {
        game.backgroundColor = "#4488AA";
        this.physics.world.setBoundsCollision(true, true, true, false);

        this.input.on('pointermove', function (pointer) {
            this.paddle.x = Phaser.Math.Clamp(pointer.x, 52, 737);

        }, this);



        /*this.input.on('pointerup', function (pointer) {

            if (this.ball.getData('onPaddle'))
            {
                this.ball.setVelocity(-75, -500);
                this.ball.setData('onPaddle', false);
            }

        }, this);*/

        this.initializeValues();
        this.initializeUpgrades();
        this.initializeMenu();
        this.spawnBricks();
        this.spawnBall();
        this.initializeGame();
    },

    initializeGame(){
        this.incrementBallStockTimer = setInterval(() => {
            this.ballStock += this.ballGenerationUpgrade.value;
        }, 1000);
        this.spawnBallTimer = setInterval(() => this.spawnBall(),100);
    },

    initializeValues(){
      this.ballStock = 1;
      this.spawnBallAllowed = true;
      this.ballMaking = false;
      this.money=0;
      this.bricks;
      this.balls = [];
      this.paddle = this.physics.add.image(400, 550, 'assets', 'paddle1').setImmovable();
    },

    initializeUpgrades(){
        this.brickRespawnUpgrade = {
            name:"brickRespawnUpgrade",
            DisplayName:"Block Respawn Upgrade",
            value : 15000,
            unit : "ms",
            increment: -500,
            owned : 0,
            baseCost: 50,
            cost : 50,
            multiplier : 1.2
        };

        this.brickValueUpgrade = {
            name:"BrickValueUpgrade",
            DisplayName:"Brick Value Upgrade",
            value : 1,
            unit : "gold",
            increment: +1,
            owned : 0,
            baseCost: 10,
            cost : 10,
            multiplier : 1.6
        };

        this.ballGenerationUpgrade ={
            name:"BallGenerationUpgrade",
            DisplayName:"Ball Generation Upgrade",
            value : 0.1,
            unit : "balls/second",
            increment: +0.1,
            owned : 1,
            baseCost: 20,
            cost : 20,
            multiplier : 1.2
        };

        this.ballPiercingUpgrade ={
            name:"BallPiercingUpgrade",
            DisplayName:"Ball Piercing Upgrade",
            value : 0,
            unit : "bricks",
            increment: +1,
            owned : 0,
            baseCost: 500,
            cost : 500,
            multiplier : 1.2
        };

        this.maxBallsUpgrade={
            name:"MaxBallsUpgrade",
            DisplayName:"Max Balls Upgrade",
            value : 1,
            unit : "balls",
            increment: +1,
            owned : 0,
            baseCost: 300,
            cost : 300,
            multiplier : 1.2
        };

        this.brickNumberUpgrade={
            name:"BrickNumberUpgrade",
            DisplayName:"Brick Number Upgrade",
            value : 10,
            unit : "Brick Lines",
            increment: +2,
            owned : 0,
            baseCost: 50,
            cost : 50,
            multiplier : 0
        };
        this.upgrades = [

      ]
    },


    incrementBallStock(){

    },



    hitBrick: function (ball, brick)
    {
        brick.disableBody(true, true);
        this.money+=this.brickValueUpgrade.value;

        setTimeout(function() { if(brick) brick.enableBody(false,0,0,true,true) }, this.brickRespawnUpgrade.value);
    },

    resetBall: function ()
    {
        this.ball.setVelocity(0);
        this.ball.setPosition(this.paddle.x, 500);
        this.ball.setData('onPaddle', true);
    },

   /* resetLevel: function ()
    {
        this.resetBall();

        this.bricks.children.each(function (brick) {

            brick.enableBody(false, 0, 0, true, true);

        });
    },*/


    hitPaddle: function (ball, paddle)
    {
        ball.hp = this.ballPiercingUpgrade.value;
        if(ball.hp > 0 && ball.hasCollider == true) {
            ball.collider.active = false;
            ball.overlap.active = true;
            ball.hasCollider = false;
        }
        var diff = 0;

        if (ball.x < paddle.x)
        {
            diff = paddle.x - ball.x;
            ball.setVelocityX(-10*diff);
        }
        else if (ball.x > paddle.x)
        {
            diff = ball.x -paddle.x;
            ball.setVelocityX(10*diff);
        }
        else
        {
            ball.setVelocityX(2 + Math.random() * 8);
        }
    },

    update: function ()
    {
        this.ballsText.setText(this.balls.length);
        if(this.balls.length > 0){
            for(let i = this.balls.length-1; i >= 0; i--){
                if(this.balls[i] != null && this.balls[i].y > 600){
                    this.balls[i].destroy();
                    this.balls[i] = null;
                }
            }
        }
        this.UIRefresh();
    },

    overlapBrick (ball,brick){
      if(!ball.hasCollider){
            ball.hp--;
          if(ball.hp <= 0 && !ball.hasCollider) {
              ball.collider.active = true;
              ball.overlap.active= false;
              ball.hasCollider = true;
            }
            brick.disableBody(true, true);
      }

    },

    spawnBall(){
        if(this.spawnBallAllowed && !this.ballMaking){
            this.ballMaking = true;
            if(this.balls.length < this.maxBallsUpgrade.value){
                this.balls.push(null);
            }
            if(this.ballStock >= 1){
                for(let i = 0; i < this.balls.length ;i++){
                    if(this.balls[i] == null){
                        let ball = this.balls[i] = this.physics.add.image(this.paddle.x, 500, 'assets', 'ball1').setCollideWorldBounds(true).setBounce(1);
                        this.physics.add.collider(ball, this.paddle, this.hitPaddle, null, this);
                        ball.hp = this.ballPiercingUpgrade.value;
                        if(ball.hp > 0){
                            ball.overlap = this.physics.add.overlap(ball, this.bricks, this.overlapBrick,null,this);
                            ball.collider =this.physics.add.collider(ball, this.bricks, this.hitBrick,null,this);
                            ball.collider.active = false;
                            ball.hasCollider = false;
                        }
                        else {
                            ball.overlap = this.physics.add.overlap(ball, this.bricks, this.overlapBrick,null,this);
                            ball.overlap.active = false;
                            ball.collider =this.physics.add.collider(ball, this.bricks, this.hitBrick,null,this);
                            ball.hasCollider = true;
                        }
                        this.physics.add.collider(ball,this.invisibleWall);
                        ball.setVelocity(-75,-300);
                    }
                }
            }
        this.ballMaking = false;
        }
    },

    buyUpgrade(upgrade){
        console.log(this.balls.length);
        //console.log(upgrade);
        if(this.money >= upgrade.cost){
            this.money -= upgrade.cost;
            upgrade.owned++;
            this.increaseCost(upgrade);
            upgrade.value+=upgrade.increment;
            if(upgrade.name == "BrickNumberUpgrade") this.spawnBricks();
            this.updateUpgradeUI(upgrade);
        }
    },

    spawnBricks(){
        this.spawnBallAllowed = false;
        for(let i = 0; i < this.balls.length; i++){
            if(this.balls[i]) this.balls[i].destroy();
            this.balls[i] = null;
        }
        let width = 650;
        let height = 250;
        let spriteWidth = 64;
        let spriteHeight = 32;
        let cellWidth = width / this.brickNumberUpgrade.value;
        let cellHeight = height / this.brickNumberUpgrade.value;
        let scaleFactorX = cellWidth/spriteWidth;
        let scaleFactorY = cellHeight/spriteHeight;
        let bricksTemp = this.physics.add.staticGroup({
            key: 'assets', frame: [ 'blue1', 'red1', 'green1', 'yellow1', 'silver1', 'purple1' ],
            frameQuantity: this.brickNumberUpgrade.value*this.brickNumberUpgrade.value,
            gridAlign: { width: this.brickNumberUpgrade.value, height: this.brickNumberUpgrade.value , cellWidth: cellWidth, cellHeight: cellHeight, x: 100, y: 100 }
        });
        console.log(scaleFactorX);
        bricksTemp.children.entries.forEach(function(element){
            element.scaleX = scaleFactorX;
            element.scaleY = scaleFactorY;
        });
        let bricksDelete = this.bricks;
        this.bricks = bricksTemp;
        if(bricksDelete) bricksDelete.destroy(true);
        this.spawnBallAllowed = true;
    },

    updateUpgradeUI(upgrade){
        upgrade.button.refresh();
    },

    increaseCost(upgrade){
        upgrade.cost = upgrade.baseCost * Math.pow(upgrade.multiplier ,upgrade.owned);
    },

    setMoneyText(){
        this.moneyText.setText("Money : " + this.money.toFixed(2) + " Gold");
    },

    setBallStockText(){
        this.ballStockText.setText("Balls in stock : " + this.ballStock.toFixed(2) + " You generate " + this.ballGenerationUpgrade.value.toFixed(2) + " balls per Second");
    },

    UIRefresh(){
        this.setMoneyText();
        this.setBallStockText();
        },

    //Menu and UI Initialization
    initializeMenu :function (){
        this.invisibleWall = this.physics.add.staticImage(800,300,'shopWall');
        this.moneyText = new Phaser.GameObjects.Text(this,600,10,"", {fill : '#00FF00'});
        this.ballStockText = new Phaser.GameObjects.Text(this,0,10,"", {fill : '#00FF00'});

        this.ballsText = new Phaser.GameObjects.Text(this,600,400,"", {fill : '#00FF00'});

        this.add.existing(this.ballsText);

        let menuTitleX = 915;
        let menuX = 820;
        let menuY = 20;
        let menuYSpacing = 20;
        this.menuText = new Phaser.GameObjects.Text(this,menuTitleX,menuY,"MENU", {fill : '#00FF00', font:'bold 40pt Arial'});

        menuY += menuYSpacing *6;


        let containerYSpacing = 0;
        let containerYDelta = 120;
        let containerXSpacing = 15;
        this.container = new Phaser.GameObjects.Container(this,menuX,menuY);
        this.upgradeBlockRespawnRateButton = new TextButton(this,containerXSpacing, containerYSpacing, 'Upgrade Brick Respawn Time', { fill: '#00FF00'},this.brickRespawnUpgrade, (upgrade) => this.buyUpgrade(upgrade));
        this.brickRespawnUpgrade.button = this.upgradeBlockRespawnRateButton;
        containerYSpacing+= containerYDelta;
        this.upgradeBrickValueButton =  new TextButton(this,containerXSpacing, containerYSpacing, 'Upgrade Brick Value', { fill: '#00FF00'},this.brickValueUpgrade, (upgrade) => this.buyUpgrade(upgrade));
        this.brickValueUpgrade.button = this.upgradeBrickValueButton;
        containerYSpacing+= containerYDelta;
        this.upgradeBallGenerationButton =  new TextButton(this,containerXSpacing, containerYSpacing, 'Upgrade Ball Generation', { fill: '#00FF00'},this.ballGenerationUpgrade, (upgrade) => this.buyUpgrade(upgrade));
        this.ballGenerationUpgrade.button = this.upgradeBallGenerationButton;
        containerYSpacing+= containerYDelta;
        this.upgradeBallPiercingButton =  new TextButton(this,containerXSpacing, containerYSpacing, 'Upgrade Ball Piercing', { fill: '#00FF00'},this.ballPiercingUpgrade, (upgrade) => this.buyUpgrade(upgrade));
        this.ballPiercingUpgrade.button = this.upgradeBallPiercingButton;
        containerYSpacing+= containerYDelta;
        this.upgradeMaxBallsButton =  new TextButton(this,containerXSpacing, containerYSpacing, 'Upgrade Max Balls', { fill: '#00FF00'},this.maxBallsUpgrade, (upgrade) => this.buyUpgrade(upgrade));
        this.maxBallsUpgrade.button = this.upgradeMaxBallsButton;
        containerYSpacing+= containerYDelta;
        this.upgradeBrickNumberButton =  new TextButton(this,containerXSpacing, containerYSpacing, 'Upgrade Number of  Bricks', { fill: '#00FF00'},this.brickNumberUpgrade, (upgrade) => this.buyUpgrade(upgrade));
        this.brickNumberUpgrade.button = this.upgradeBrickNumberButton;

        this.container.add(this.upgradeBrickNumberButton);
        this.container.add(this.upgradeBallPiercingButton);
        this.container.add(this.upgradeMaxBallsButton);
        this.container.add(this.upgradeBlockRespawnRateButton);
        this.container.add(this.upgradeBrickValueButton);
        this.container.add(this.upgradeBallGenerationButton);

        this.container.height = 1000;
        this.container.with = 380;

        this.containerMaskGraphics = this.add.graphics();

        var color = 0x00ffff;
        var thickness = 2;
        var alpha = 1;
        this.containerMaskGraphics.lineStyle(thickness, color, alpha);
        this.containerMaskGraphics.strokeRect(menuX, menuY, 350,400);
        this.containerMaskGraphics.fillStyle(color, 0);
        this.containerMaskGraphics.fillRect(menuX, menuY, 350, 400);
        this.geometryMask = new Phaser.Display.Masks.GeometryMask(this,this.containerMaskGraphics);
        this.container.mask =this.geometryMask  ;

        this.containerHitArea = new Phaser.Geom.Rectangle(0,0,400,2000);

        this.container.inputEnabled = true;

        this.container.setInteractive(this.containerHitArea,Phaser.Geom.Rectangle.Contains)
            .on('pointerover', function(){
                console.log("container pointer over");
            });

        this.container.on('drag', function(pointer, dragX, dragY){ if(dragY < 160) this.y = dragY });


        this.input.setDraggable(this.container);


        console.log(this.container.x + " " + this.container.y);

        let render = this.add.graphics();
        let bounds = this.container.getBounds();

        render.lineStyle(3, 0xffff37);
        //render.strokeRectShape(bounds);

        /*viewport.addNode(column);*/

        this.add.existing(this.ballStockText);
        this.add.existing(this.moneyText);
        this.add.existing(this.containerHitArea);
        this.add.existing(this.menuText);
        this.add.existing(this.container);
    },

    menuHitCallback(hitArea,x,y,object){

    }

});

let config = {
    type: Phaser.WEBGL,
    width: 1200,
    height: 600,
    parent: 'phaser-example',
    scene: [ Breakout ],
    physics: {
        default: 'arcade'
    },
    transparent: true,
    backgroundColor: 'rgba(16,15,17,0.82)'
};

let game = new Phaser.Game(config);
