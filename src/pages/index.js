'use client';
import {
    Box,
    Text,
    Input,
    Button,
    Container,
    Checkbox,
    ButtonGroup,
    List,
    ListItem,
    Flex
} from "@chakra-ui/react";
import { Line } from "react-chartjs-2";
import { useEffect, useState } from "react";

import { factorial, pow } from "@/utils";

export default function Home() {
    const [n, setN] = useState(2);
    const [y, setY] = useState(0.2833);
    const [t, setT] = useState(6);

    const [queueCount, setQueueCount] = useState(null);
    const [endlessQueue, setEndlessQueue] = useState(true)

    const [result, setResult] = useState(null);
    const [smoError, setSmoError] = useState(false);

    const onCulculate = () => {
        let data = {};

        data.u = 1 / t;

        data.p = y / data.u;

        if (n > 1) {
            const condition = data.p / n;
            if (condition >= 1) {
                setSmoError(true);
                return;
            }
        } else {
            if (data.p >= 1) {
                setSmoError(true);
                return;
            }
        }

        // p0
        let p0 = 1;

        if (n > 1) {
            for (let i = 1; i <= n; i++) {
                p0 = p0 + (pow(data.p, i) / i);
            }

            data.p0 = pow(p0, -1);
        } else {
            data.p0 = p0 - data.p;
        }


        // p1, p2, p3...
        data.p_array = [];
        data.p_array.push(data.p0);

        for (let i = 1; i <= n; i++) {
            if (n > 1) {
                let p = (
                    pow(data.p, i) / factorial(i)
                ) * data.p0;

                data.p_array.push(p);
            } else {
                let p = pow(data.p, i) * (1 - data.p);

                data.p_array.push(p);
            }
        }

        data.p_otk = 0;
        data.Q = 1 - data.p_otk;
        data.A = data.Q * y;

        if (n > 1) {
            data.k = y / data.u;
        } else {
            data.k = data.p;
        }

        // r0
        if (n > 1) {
            data.r0 = (
                pow(data.p, Number(n) + 1) * data.p0
            ) / (
                n * factorial(n) * pow(1 - (data.p / n), 2)
            )
        } else {
            data.r0 = pow(data.p, 2) / (1 - data.p);
        }

        // t0
        if (n > 1) {
            data.t0 = data.r0 / y;
        } else {
            data.t0 = pow(data.p, 2) / (y * (1 - data.p))
        }

        if (n == 1) {
            data.z_sist = data.r0 + data.p;
            data.t_sist = t + data.t0;
        }

        // Tables
        const y_array = [0.01, 0.05, 0.1, 0.15, 0.2, y, 0.3, 0.35, 0.4, 0.45];
        const t_array = [1, 2, 4, t, 10, 20, 30, 40, 50, 60];
        data.tables = {};
        data.tables.r0_through_y = {};
        data.tables.r0_through_y.y = y_array;
        data.tables.r0_through_y.x = [];

        for (let i in y_array) {
            const u = 1 / t;

            const p = y_array[i] / u;

            let table_p0 = 1;

            if (n > 1) {
                for (let i = 1; i <= n; i++) {
                    table_p0 = table_p0 + (pow(p, i) / i);
                }

                table_p0 = pow(table_p0, -1);
            } else {
                table_p0 = table_p0 - p;
            }

            if (n > 1) {
                const r0 = (
                    pow(p, Number(n) + 1) * table_p0
                ) / (
                    n * factorial(n) * pow(1 - (p / n), 2)
                )
                data.tables.r0_through_y.x.push(r0)
            } else {
                const r0 = pow(p, 2) / (1 - p);
                data.tables.r0_through_y.x.push(r0)
            }
        }

        data.tables.r0_through_t = {};
        data.tables.r0_through_t.y = t_array;
        data.tables.r0_through_t.x = [];
        for (let i in t_array) {
            const u = 1 / t_array[i];

            const p = y / u;

            let table_p0 = 1;

            if (n > 1) {
                for (let i = 1; i <= n; i++) {
                    table_p0 = table_p0 + (pow(p, i) / i);
                }

                table_p0 = pow(table_p0, -1);
            } else {
                table_p0 = table_p0 - p;
            }

            if (n > 1) {
                const r0 = (
                    pow(p, Number(n) + 1) * table_p0
                ) / (
                    n * factorial(n) * pow(1 - (p / n), 2)
                )
                data.tables.r0_through_t.x.push(r0)
            } else {
                const r0 = pow(p, 2) / (1 - p);
                data.tables.r0_through_t.x.push(r0)
            }
        }

        // Charts
        data.charts = {};
        data.charts.y = [y.toFixed(2), 1, 2, 4, 10, 50, 200];
        data.charts.p = data.charts.y.map((item) => {
            return item * t;
        });

        data.charts.Q = data.charts.y.map(() => {
            return 1 - data.p_otk;
        });
        data.charts.A = data.charts.Q.map((item, index) => {
            return item * data.charts.y[index];
        })
        data.charts.K = data.charts.A.map((item) => {
            return item / data.u;
        });

        setResult(data);
    }

    const getTablesData = () => {

    }

    useEffect(() => {
        setResult(null);
        setSmoError(false);
    }, [n, y, t, queueCount, endlessQueue])

    return (
        <Container paddingY={20}>
            <Box>
                <Text>
                    <b>Задача: </b>На контейнерную площадку с двумя кранами прибывает простейший
                    поток автомашин с интенсивностью 17 автомашин в час. Время погрузки-
                    выгрузки показательное, составляет в среднем 6 минут (обслt ). Очередь
                    неограниченна.
                </Text>
                <Text className={"mt-2"}>
                    17 машин в час = { (17 / 60).toFixed(4) } в минуту
                </Text>
            </Box>
            <Box className={"mt-8"}>
                <div>
                    <Text mb='8px'>Количество каналов</Text>
                    <Input
                        value={n}
                        onChange={(event) => setN(event.target.value)}
                        size='sm'
                    />
                </div>
                <div>
                    <Text mb='8px'>Интенсивность машин</Text>
                    <Input
                        value={y}
                        onChange={(event) => setY(event.target.value)}
                        size='sm'
                    />
                </div>
                <div>
                    <Text mb='8px'>Время погрузки</Text>
                    <Input
                        value={t}
                        onChange={(event) => setT(event.target.value)}
                        size='sm'
                    />
                </div>
                <div>
                    <Checkbox
                        isChecked={endlessQueue}
                        disabled={true}
                        onChange={(e) => setEndlessQueue(e.target.checked)}
                    >
                        Бесконечная очередь
                    </Checkbox>
                    { !endlessQueue ? (
                        <div>
                            <Text mb='8px'>Максимальная длина очереди</Text>
                            <Input
                                value={queueCount}
                                onChange={(event) => setQueueCount(event.target.value)}
                                size='sm'
                            />
                        </div>
                    ) : null}
                </div>
                <ButtonGroup className={"mt-2"} gap={2}>
                    <Button
                        onClick={onCulculate}
                        disabled={!n || !t || !y}
                        className={"w-full"}
                    >
                        Расчитать
                    </Button>
                    <Button
                        onClick={() => setResult(null)}
                        disabled={!result}
                        className={"w-full"}
                    >
                        Очистить
                    </Button>
                </ButtonGroup>
            </Box>
            { smoError ? (
                <Box>
                    <Text>
                        СМО не работает из-за неограниченно возрастающей очереди
                    </Text>
                </Box>
            ) : null}
            { result ? (
                <Box>
                    <Text>
                        Тип системы массового обслуживания:&nbsp;
                        { endlessQueue && n > 1 ? (
                            "Многоканальная СМО с неограниченной очередью"
                        ) : endlessQueue && n == 1 ? (
                            "Одноканальная СМО с неограниченной очередью"
                        ) : (
                            "Многоканальная СМО с ограниченным количеством мест в очереди"
                        )}
                    </Text>
                    <Text>
                        Интенсивность потока обслуживания: { result.u.toFixed(2) }
                    </Text>
                    <Text>
                        Коэффициент загрузки системы: { result.p.toFixed(2) }
                    </Text>
                    <Text>
                        Начальная вероятность: { result.p0.toFixed(2) }
                    </Text>
                    <Flex>
                        <Text>
                            Вероятности состояний:&nbsp;
                        </Text>
                        <List>
                            { result.p_array.map((item, index) => (
                                <ListItem
                                    key={index}
                                >
                                    p{ index }: { item.toFixed(2) }
                                </ListItem>
                            ))}
                        </List>
                    </Flex>
                    <Text>
                        Вероятность отказа: { result.p_otk } { result.p_otk === 0 ? "(Очередь не ограничена)" : "" }
                    </Text>
                    <Text>
                        Относительная пропускная способность: { result.Q }
                    </Text>
                    <Text>
                        Абсолютная пропускная способность: { result.A.toFixed(2) } ({ (result.A * 100).toFixed(2) }% в минуту)
                    </Text>
                    <Text>
                        Среднее число занятых каналов: { result.k.toFixed(2) }
                    </Text>
                    <Text>
                        Среднее число автомобилей в очереди: { result.r0.toFixed(2) }
                    </Text>
                    <Text>
                        Время ожидания обслуживания: { result.t0.toFixed(2) }
                    </Text>
                    { result.z_sist ? (
                        <Text>
                            Среднее число заявок в СМО: { result.z_sist.toFixed(2) }
                        </Text>
                    ) : null}
                    { result.t_sist ? (
                        <Text>
                            Среднее время пребывания заявки в СМО: { result.t_sist.toFixed(2) }
                        </Text>
                    ) : null}

                    { result.charts ? (
                        <Text className={"mt-5"}>
                            Различные значения λ для расчетов A и K: { result.charts.y.join(", ") }
                        </Text>
                    ) : null}

                    { result.tables.r0_through_y ? (
                        <Line
                            options={{
                                responsive: true,
                                plugins: {
                                    legend: {
                                        display: false,
                                    },
                                    title: {
                                        display: true,
                                        text: 'Зависимость средней длины очереди от интенсивности входного потока',
                                    },
                                },
                            }}
                            data={{
                                labels: result.tables.r0_through_y.y,
                                datasets: [
                                    {
                                        data: result.tables.r0_through_y.x,
                                        borderColor: 'rgb(255, 99, 132)',
                                        backgroundColor: 'rgba(255, 99, 132, 0.5)',
                                    }
                                ]
                            }}
                        />
                    ) : null}

                    { result.tables.r0_through_t ? (
                        <Line
                            options={{
                                responsive: true,
                                plugins: {
                                    legend: {
                                        display: false,
                                    },
                                    title: {
                                        display: true,
                                        text: 'Зависимость средней длины очереди от времени обслуживания',
                                    },
                                },
                            }}
                            data={{
                                labels: result.tables.r0_through_t.y,
                                datasets: [
                                    {
                                        data: result.tables.r0_through_t.x,
                                        borderColor: 'rgb(255, 99, 132)',
                                        backgroundColor: 'rgba(255, 99, 132, 0.5)',
                                    }
                                ]
                            }}
                        />
                    ) : null}
                </Box>
            ) : null}
        </Container>
    )
}
