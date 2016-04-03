/**
 * Created by kdban on 2/19/2016.
 */

var Synchronizer = require('polyball/client/Synchronizer');
var Model = require('polyball/shared/Model');
var PubSub = require('polyball/shared/PubSub');
var CommsEvents = require('polyball/shared/CommsEvents');
var Logger = require('polyball/shared/Logger');

describe('Synchronizer', function () {
    describe('#synchronizeSnapshot', function () {

        var model,
            comms,
            synchronizer,
            addSnapshot,
            updateSnapshot,
            deleteSnapshot;

        beforeEach(function () {
            Logger.setLevel("WARN");

            model = new Model();
            comms = new PubSub({
                events: CommsEvents.ClientToClient
            });

            synchronizer = new Synchronizer({
                comms: comms,
                model: model
            });

            addSnapshot = {
                balls: [
                    {
                        id: 1,
                        lastTouchedID: 11,
                        body: {
                            radius: 10,
                            state: {
                                pos: {x: 10, y: 20},
                                vel: {x: 11, y: 21},
                                acc: {x: 12, y: 22},
                                angular: {
                                    pos: 2,
                                    vel: 2,
                                    acc: 2
                                },
                                old: {
                                    pos: {x: 10, y: 20},
                                    vel: {x: 11, y: 21},
                                    acc: {x: 12, y: 22},
                                    angular: {
                                        pos: 2,
                                        vel: 2,
                                        acc: 2
                                    }
                                }
                            }
                        }
                    },
                    {
                        id: 2,
                        lastTouchedID: 22,
                        body: {
                            radius: 20,
                            state: {
                                pos: {x: 20, y: 40},
                                vel: {x: 21, y: 41},
                                acc: {x: 22, y: 42},
                                angular: {
                                    pos: 2,
                                    vel: 2,
                                    acc: 2
                                },
                                old: {
                                    pos: {x: 20, y: 20},
                                    vel: {x: 21, y: 22},
                                    acc: {x: 22, y: 22},
                                    angular: {
                                        pos: 2,
                                        vel: 2,
                                        acc: 2
                                    }
                                }
                            }
                        }
                    },
                    {
                        id: 3,
                        lastTouchedID: 22,
                        body: {
                            radius: 20,
                            state: {
                                pos: {x: 20, y: 60},
                                vel: {x: 21, y: 61},
                                acc: {x: 22, y: 62},
                                angular: {
                                    pos: 2,
                                    vel: 2,
                                    acc: 2
                                },
                                old: {
                                    pos: {x: 20, y: 20},
                                    vel: {x: 21, y: 22},
                                    acc: {x: 22, y: 22},
                                    angular: {
                                        pos: 2,
                                        vel: 2,
                                        acc: 2
                                    }
                                }
                            }
                        }
                    }
                ]
            };

            updateSnapshot = {
                balls: [
                    {
                        id: 1,
                        lastTouchedID: 22,  // <-- update is here from 11
                        body: {
                            radius: 10,
                            state: {
                                pos: {x: 10, y: 20},
                                vel: {x: 11, y: 21},
                                acc: {x: 12, y: 22},
                                angular: {
                                    pos: 2,
                                    vel: 2,
                                    acc: 2
                                },
                                old: {
                                    pos: {x: 10, y: 20},
                                    vel: {x: 11, y: 21},
                                    acc: {x: 12, y: 22},
                                    angular: {
                                        pos: 2,
                                        vel: 2,
                                        acc: 2
                                    }
                                }
                            }
                        }
                    },
                    {
                        id: 2,
                        lastTouchedID: 22,
                        body: {
                            radius: 20,
                            state: {
                                pos: {x: 20, y: 40},
                                vel: {x: 41, y: 81},  // <-- update is here from 21, 41
                                acc: {x: 22, y: 42},
                                angular: {
                                    pos: 2,
                                    vel: 2,
                                    acc: 2
                                },
                                old: {
                                    pos: {x: 20, y: 20},
                                    vel: {x: 21, y: 22},
                                    acc: {x: 22, y: 22},
                                    angular: {
                                        pos: 2,
                                        vel: 2,
                                        acc: 2
                                    }
                                }
                            }
                        }
                    },
                    {
                        id: 3,
                        lastTouchedID: 22,
                        body: {
                            radius: 20,
                            state: {
                                pos: {x: 20, y: 60},
                                vel: {x: 21, y: 61},
                                acc: {x: 22, y: 62},
                                angular: {
                                    pos: 2,  // <-- update is here from 3
                                    vel: 2,  // <-- update is here from 3
                                    acc: 2   // <-- update is here from 3
                                },
                                old: {
                                    pos: {x: 20, y: 20},
                                    vel: {x: 21, y: 22},
                                    acc: {x: 22, y: 22},
                                    angular: {
                                        pos: 2,  // <-- update is here from 3
                                        vel: 2,  // <-- update is here from 3
                                        acc: 2   // <-- update is here from 3
                                    }
                                }
                            }
                        }
                    }
                ]
            };

            deleteSnapshot = {
                balls: [
                    {
                        id: 2,
                        lastTouchedID: 22,
                        body: {
                            radius: 20,
                            state: {
                                pos: {x: 20, y: 40},
                                vel: {x: 41, y: 81},  // <-- update is here from 21, 41
                                acc: {x: 22, y: 42},
                                angular: {
                                    pos: 2,
                                    vel: 2,
                                    acc: 2
                                },
                                old: {
                                    pos: {x: 20, y: 20},
                                    vel: {x: 21, y: 22},
                                    acc: {x: 22, y: 22},
                                    angular: {
                                        pos: 2,
                                        vel: 2,
                                        acc: 2
                                    }
                                }
                            }
                        }
                    }
                ]
            };
        });

        it('should add balls to the model', function () {
            comms.fireEvent(CommsEvents.ClientToClient.snapshotReceived, addSnapshot);

            model.ballCount().should.equal(3);

            model.getBall(1).lastTouchedID.should.equal(11);
            model.getBall(2).body.geometry.radius.should.equal(20);
            model.getBall(3).body.state.vel.x.should.equal(21);
        });

        it('should update balls in the model', function () {
            comms.fireEvent(CommsEvents.ClientToClient.snapshotReceived, addSnapshot);
            
            model.setCurrentRoundTime(0);

            comms.fireEvent(CommsEvents.ClientToClient.snapshotReceived, updateSnapshot);

            synchronizer.tick(20);
            
            model.getBall(1).lastTouchedID.should.equal(22);
            model.getBall(2).body.state.vel.x.should.be.greaterThan(21);
            model.getBall(2).body.state.vel.y.should.be.greaterThan(41);
            model.getBall(3).body.state.old.angular.vel.should.be.lessThan(3);
        });

        it('should delete balls from the model', function () {
            comms.fireEvent(CommsEvents.ClientToClient.snapshotReceived, addSnapshot);
            comms.fireEvent(CommsEvents.ClientToClient.snapshotReceived, updateSnapshot);
            comms.fireEvent(CommsEvents.ClientToClient.snapshotReceived, deleteSnapshot);

            model.ballCount().should.equal(1);
        });
    });
});