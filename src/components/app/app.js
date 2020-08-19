import React, {Component, Suspense} from 'react';
import "./app.sass";

const Input = React.lazy(() => import('../input'));

export default class App extends Component {
    state = {
        getting: false,
        searchWords: "",
        channelList: [],
        channelListSortable: [],
        channelView: [],
        channelPrograms: [],
        programActiveTime: "",
        programActiveTimeNext: ""
    };

    date = new Date();
    dateNow = this.date.getFullYear() + "-" + (this.date.getMonth() + 1) + "-" + this.date.getDate();
    url = 'http://epg.domru.ru';

    activateGetting = e => {
        this.setState({
            getting: true
        });
    }

    handleSubmit = async (typeRequest, xvid) => {
        let url = "";
        if (typeRequest === 'getChannelList') {
            url = 'http://epg.domru.ru/channel/list?domain=ekat';
            fetch(url)
                .then(response => response.json())
                .then(data => {
                    this.setState({
                        channelList: data,
                        channelListSortable: data,
                        getting: false
                    });
                })
                .catch(error => console.error(error))
        }

        if (typeRequest === 'getProgram' && xvid) {
            url = `http://epg.domru.ru/program/list?date_from=${this.dateNow}+00:00:00&date_to=${this.dateNow}+23:59:59&xvid=${xvid}&domain=ekat`;
            fetch(url)
                .then(response => response.json())
                .then(data => {
                    this.setState({
                        channelPrograms: Object.values(data)[0],
                        getting: false
                    });
                    this.comparisonTime(this.state.channelPrograms);
                    this.toScroll() // Прокручиваем до текущей трансляции
                })
                .catch(error => console.error(error))
        }
    };

    // Получаем программу передач конкретного канала
    getChannelProgram = e => {
        this.handleSubmit('getProgram', e.target.dataset.xvid);
    }

    // Сохраняем выбранный канал
    checkedChannel = (img, title) => {
        this.setState({
            channelView: [img, title, this.dateNow]
        });
    }

    // Выбор текущей трансляции и следующей
    comparisonTime = array => {
        this.setState({
            getting: true
        });
        for (let i = array.length; i--;) { // Обратный цикл =)
            let d = new Date(array[i].start);
            if (d < this.date) { // Сравнение настоящего времени и времени программы
                this.setState({
                    programActiveTime: array[i].start,
                    programActiveTimeNext: array[i + 1].start,
                    getting: false
                });
                break; // Останавливаем проверку, чтобы отметить только первую программу
            }
        }
    }

    // Поиск по списку каналов
    onSearch = e => {
        let arr = this.state.channelList;

        // Обнуление списка каналов
        this.setState({
            channelListSortable: arr
        })
        let newArr = [];
        // Сравнение введенного текста и названия канала, приведение обоих к UpperCase
        arr.map(item => item.title.toUpperCase().indexOf(e.target.value.toUpperCase()) !== -1 ? newArr.push(item) : false);
        this.setState({
            channelListSortable: newArr
        })
    }

    // Прокрутка до текущей трансляции
    scrollProgram = React.createRef();
    toScroll = () => {
        this.scrollProgram.current.scrollIntoView();
    };

    componentDidMount() {
        this.handleSubmit('getChannelList'); // Получение списка каналов при загрузке страницы
    }

    render() {
        let {channelView, channelPrograms, channelListSortable, programActiveTime, programActiveTimeNext, getting} = this.state;
        return (
            <div className="form_wrapper">
                <form
                    id="sendform"
                    encType="multipart/form-data"
                    method="POST">
                    <h1>Domru телепрограмма</h1>
                    <h1>{this.dateNow}</h1>
                    <div className="row">
                        <div>

                            <Suspense fallback={<div>Загрузка поисковика...</div>}>
                                <section>
                                    <Input
                                        name="name_channel"
                                        placehold="Поиск телеканала"
                                        onChange={this.onSearch}
                                    />
                                </section>
                            </Suspense>
                            <div className="channel_list">
                                {channelListSortable.map(item => (
                                    <a href='#' key={item.chid} data-xvid={item.xvid}
                                       onClick={(e) => {
                                           this.activateGetting();
                                           this.getChannelProgram(e);
                                           this.checkedChannel(this.url + item.logo, item.title);
                                       }}
                                    >
                                        {item.logo ? <img src={this.url + item.logo} alt=""/> : false}
                                        {item.title}</a>
                                ))}
                            </div>
                        </div>
                        <div>
                            {channelView.length > 0 ? (
                                <div className="checked_channel">
                                    <img src={channelView[0]}/>
                                    <p>{channelView[1]}</p>
                                </div>
                            ) : (
                                <div className="checked_channel">
                                    <p>Выберите канал</p>
                                </div>
                            )
                            }
                            <div className="program_list">
                                {getting ? (
                                    <img className="img-loader" src="./img/bars.svg" alt=""/>
                                ) : (
                                    channelPrograms.map(item => (
                                        <div key={item.start}
                                             ref={item.start === programActiveTime ? this.scrollProgram : false}
                                             className={item.start === programActiveTime ? 'active' : item.start === programActiveTimeNext ? 'next' : ""}>
                                            <span>{item.start.split(' ')[1].replace(/.{3}$/, '')}</span>
                                            <p>{item.title}</p>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        )
    }
}
