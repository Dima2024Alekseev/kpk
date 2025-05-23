import ExcelJS from 'exceljs';

const ExcelExporter = {
    exportStudents: async (students, directions, selectedDirection, currentGroupName) => {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Студенты');

        // Заголовок с информацией о направлении и группе
        const direction = directions.find(d => d._id === selectedDirection);
        const directionName = direction?.name || 'ИСиП';
        const directionDescription = direction?.description || 'Информационные системы и программирование';
        const groupName = currentGroupName || 'все группы';

        worksheet.addRow([`Направление: ${directionName} (${directionDescription}), Группа: ${groupName}`]);
        worksheet.mergeCells(`A1:H1`); // Изменили на H1 из-за добавления нового столбца

        // Стиль для заголовка направления
        const directionRow = worksheet.getRow(1);
        directionRow.eachCell((cell) => {
            cell.font = { bold: true, size: 14, color: { argb: 'FFFFFFFF' } };
            cell.alignment = { vertical: 'middle', horizontal: 'center' };
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4472C4' } };
        });

        // Заголовки столбцов (добавили колонку "Кол-во мероприятий")
        worksheet.addRow([
            'Фамилия', 'Имя', 'Отчество', 'Группа',
            'Специальность', 'Номер студ. билета',
            'Кол-во мероприятий', // Новая колонка
            'Мероприятия'
        ]);

        // Стиль для заголовков столбцов
        const headerRow = worksheet.getRow(2);
        headerRow.eachCell((cell) => {
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4472C4' } };
            cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
            cell.alignment = { vertical: 'middle', horizontal: 'center' };
            cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
        });

        // Настройка столбцов (добавили колонку для количества мероприятий)
        worksheet.columns = [
            { width: 20 }, { width: 15 }, { width: 20 },
            { width: 10, alignment: { horizontal: 'center' } },
            { width: 25, alignment: { horizontal: 'center' } },
            { width: 25, alignment: { horizontal: 'center' } },
            { width: 40, alignment: { horizontal: 'center' } }, // Новая колонка
            { width: 40 }
        ];

        // Загружаем все мероприятия один раз
        let allEvents = [];
        try {
            const response = await fetch('http://localhost:5000/api/events?populate=students');
            if (response.ok) {
                allEvents = await response.json();
            }
        } catch (err) {
            console.error("Ошибка при загрузке мероприятий:", err);
        }

        // Добавляем данные студентов
        students.forEach(student => {
            // Находим мероприятия студента
            const studentEvents = allEvents.filter(event =>
                event.students.some(s => s._id === student._id)
            );

            // Форматируем мероприятия
            const eventsString = studentEvents.map(event =>
                `${event.title} (${event.date} ${event.time}, ${event.place})`
            ).join('\n');

            const newRow = worksheet.addRow([
                student.lastName || 'Нет данных',
                student.firstName || 'Нет данных',
                student.middleName || 'Нет данных',
                student.group?.name || 'Нет данных',
                student.specialty?.name || 'Нет данных',
                student.studentId || 'Нет данных',
                studentEvents.length,
                eventsString || 'Нет данных'
            ]);

            const LastNameStudentsCell = newRow.getCell('A');
            LastNameStudentsCell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };

            const NameStudentsCell = newRow.getCell('B');
            NameStudentsCell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };

            const SurNameStudentsCell = newRow.getCell('C');
            SurNameStudentsCell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };

            const GroupStudentsCell = newRow.getCell('D');
            GroupStudentsCell.alignment = { vertical: 'middle', horizontal: 'center' };

            const SpecialityStudentsCell = newRow.getCell('E');
            SpecialityStudentsCell.alignment = { vertical: 'middle', horizontal: 'center' };

            const StudentCardStudentsCell = newRow.getCell('F');
            StudentCardStudentsCell.alignment = { vertical: 'middle', horizontal: 'center' };

            const countCell = newRow.getCell('G');
            countCell.alignment = { vertical: 'middle', horizontal: 'center' };

            // Настройка стиля для ячейки с мероприятиями
            const eventsCell = newRow.getCell('H');
            eventsCell.alignment = {
                vertical: 'middle',
                horizontal: 'left',
                wrapText: true
            };
        });

        // Применяем границы ко всем ячейкам с данными
        worksheet.eachRow((row, rowNumber) => {
            if (rowNumber > 2) {
                row.eachCell((cell) => {
                    cell.border = {
                        top: { style: 'thin' },
                        left: { style: 'thin' },
                        bottom: { style: 'thin' },
                        right: { style: 'thin' }
                    };
                });
            }
        });

        // Генерация и скачивание файла
        const fileName = `Студенты_${directionName}_${groupName}_${new Date().toLocaleDateString()}.xlsx`;
        const buffer = await workbook.xlsx.writeBuffer();
        const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = fileName;
        link.click();
        URL.revokeObjectURL(link.href);
    },

    exportTeachers: async (teachers, departments, selectedDepartment) => {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Преподаватели');

        // Получаем информацию о кафедре/ПЦК
        const department = departments.find(d => d._id === selectedDepartment);
        const departmentName = department?.name || 'Все ПЦК';

        // Добавляем строку с информацией о кафедре
        worksheet.addRow([`Преподаватели: ${departmentName}`]);

        // Объединяем ячейки для заголовка
        worksheet.mergeCells(`A1:F1`);

        // Стиль для строки заголовка
        const headerRow = worksheet.getRow(1);
        headerRow.eachCell((cell) => {
            cell.font = {
                bold: true,
                size: 14,
                color: { argb: 'FFFFFFFF' }
            };
            cell.alignment = { vertical: 'middle', horizontal: 'center' };
            cell.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FF4472C4' }
            };
        });

        // Добавляем заголовки таблицы
        worksheet.addRow([
            'Фамилия',
            'Имя',
            'Отчество',
            'ПЦК',
            'Кол-во мероприятий', // Новый столбец
            'Мероприятия' // Новый столбец
        ]);

        // Стиль для заголовков столбцов
        const columnHeaderRow = worksheet.getRow(2);
        columnHeaderRow.eachCell((cell) => {
            cell.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FF4472C4' }
            };
            cell.font = {
                bold: true,
                color: { argb: 'FFFFFFFF' }
            };
            cell.alignment = { vertical: 'middle', horizontal: 'center' };
            cell.border = {
                top: { style: 'thin' },
                left: { style: 'thin' },
                bottom: { style: 'thin' },
                right: { style: 'thin' }
            };
        });

        // Устанавливаем ширину столбцов и выравнивание
        worksheet.columns = [
            { width: 20, alignment: { horizontal: 'center' }, },  // Фамилия
            { width: 15, alignment: { horizontal: 'center' }, },  // Имя
            { width: 20, alignment: { horizontal: 'center' }, },  // Отчество
            { width: 80, alignment: { horizontal: 'center' } },   // ПЦК
            { width: 20, alignment: { horizontal: 'center' } },   // Кол-во мероприятий
            { width: 40 }                                          // Мероприятия
        ];

        // Загружаем все мероприятия один раз
        let allEvents = [];
        try {
            const response = await fetch('http://localhost:5000/api/events?populate=teachers');
            if (response.ok) {
                allEvents = await response.json();
            }
        } catch (err) {
            console.error("Ошибка при загрузке мероприятий:", err);
        }

        // Добавляем данные
        teachers.forEach(teacher => {
            // Находим мероприятия преподавателя
            const teacherEvents = allEvents.filter(event =>
                event.teachers.some(t => t._id === teacher._id)
            );

            // Форматируем мероприятия
            const eventsString = teacherEvents.map(event =>
                `${event.title} (${event.date} ${event.time}, ${event.place})`
            ).join('\n');

            const newRow = worksheet.addRow([
                teacher.lastName || 'Нет данных',
                teacher.firstName || 'Нет данных',
                teacher.middleName || 'Нет данных',
                teacher.department?.name || 'Нет данных',
                teacherEvents.length, // Количество мероприятий
                eventsString || 'Нет данных' // Список мероприятий
            ]);

            const LastnameTeachersCell = newRow.getCell('A');
            LastnameTeachersCell.alignment = { vertical: "middle", horizontal: 'center', wrapText: true };

            const NameTeachersCell = newRow.getCell('B');
            NameTeachersCell.alignment = { vertical: "middle", horizontal: 'center', wrapText: true };

            const SurnameTeachersCell = newRow.getCell('C');
            SurnameTeachersCell.alignment = { vertical: "middle", horizontal: 'center', wrapText: true };

            // Применяем выравнивание для столбца с ПЦК
            const departmentCell = newRow.getCell('D');
            departmentCell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };

            // Настройка стиля для ячейки с количеством мероприятий
            const countCell = newRow.getCell('E');
            countCell.alignment = { vertical: 'middle', horizontal: 'center' };

            // Настройка стиля для ячейки с мероприятиями
            const eventsCell = newRow.getCell('F');
            eventsCell.alignment = {
                vertical: 'middle',
                horizontal: 'left',
                wrapText: true
            };
        });

        // Применяем стиль к данным (границы)
        worksheet.eachRow((row, rowNumber) => {
            if (rowNumber > 2) { // Пропускаем строки заголовков (1 и 2)
                row.eachCell((cell) => {
                    cell.border = {
                        top: { style: 'thin' },
                        left: { style: 'thin' },
                        bottom: { style: 'thin' },
                        right: { style: 'thin' }
                    };
                });
            }
        });

        // Генерируем имя файла
        const fileName = `Преподаватели_${departmentName}_${new Date().toLocaleDateString()}.xlsx`;

        // Сохраняем файл
        const buffer = await workbook.xlsx.writeBuffer();
        const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = fileName;
        link.click();
        URL.revokeObjectURL(link.href);
    },

    // Добавляем новый метод в объект ExcelExporter
    exportStudentDetails: async (student, events) => {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Студент');

        // 1. Заголовок с информацией о направлении и группе
        const directionInfo = `Направление: ${student.specialty?.name || 'ИСиП'} (${student.specialty?.description || 'Информационные системы и программирование'}), Группа: ${student.group?.name || ''}`;
        worksheet.addRow([directionInfo]);
        worksheet.mergeCells('A1:G1');

        // Стиль для заголовка направления
        const directionRow = worksheet.getRow(1);
        directionRow.eachCell((cell) => {
            cell.font = { bold: true, size: 14, color: { argb: 'FFFFFFFF' } };
            cell.alignment = { vertical: 'middle', horizontal: 'center' };
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4472C4' } };
        });

        // 2. Таблица с данными студента
        const studentHeaders = ['Фамилия', 'Имя', 'Отчество', 'Группа', 'Специальность', 'Номер студ. билета', 'Кол-во мероприятий'];

        worksheet.addRow(studentHeaders);

        // Стиль для заголовков студента
        const studentHeaderRow = worksheet.getRow(2);
        studentHeaderRow.eachCell((cell) => {
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4472C4' } };
            cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
            cell.alignment = { vertical: 'middle', horizontal: 'center' };
            cell.border = {
                top: { style: 'thin' },
                left: { style: 'thin' },
                bottom: { style: 'thin' },
                right: { style: 'thin' }
            };
        });

        // Данные студента
        const studentDataRow = worksheet.addRow([
            student.lastName || 'Нет данных',
            student.firstName || 'Нет данных',
            student.middleName || 'Нет данных',
            student.group?.name || 'Нет данных',
            student.specialty?.name || 'Нет данных',
            student.studentId || 'Нет данных',
            events.length
        ]);

        // Стиль для данных студента
        studentDataRow.eachCell((cell) => {
            cell.alignment = { vertical: 'middle', horizontal: 'center' };
            cell.border = {
                top: { style: 'thin' },
                left: { style: 'thin' },
                bottom: { style: 'thin' },
                right: { style: 'thin' }
            };
        });

        // 3. Таблица с мероприятиями
        worksheet.addRow([]); // Пустая строка разделитель

        // Заголовок "Мероприятия студента"
        worksheet.addRow(['Мероприятия студента']);
        worksheet.mergeCells('A5:G5');
        const eventsTitleRow = worksheet.getRow(5);
        eventsTitleRow.eachCell((cell) => {
            cell.font = { bold: true, size: 14, color: { argb: 'FFFFFFFF' } };
            cell.alignment = { vertical: 'middle', horizontal: 'center' };
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4472C4' } };
        });

        // Заголовки таблицы мероприятий
        const eventHeaders = ['Название', 'Дата', 'Время', 'Место', 'Организатор', 'Город', 'Ответственный'];
        worksheet.addRow(eventHeaders);

        // Стиль для заголовков мероприятий (синий фон, белый текст, границы)
        const eventHeaderRow = worksheet.getRow(6);
        eventHeaderRow.eachCell((cell) => {
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4472C4' } };
            cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
            cell.alignment = { vertical: 'middle', horizontal: 'center' };
            cell.border = {
                top: { style: 'thin' },
                left: { style: 'thin' },
                bottom: { style: 'thin' },
                right: { style: 'thin' }
            };
        });

        // Данные мероприятий (центрированные, с границами)
        events.forEach(event => {
            const eventRow = worksheet.addRow([
                event.title || 'Нет данных',
                event.date || 'Нет данных',
                event.time || 'Нет данных',
                event.place || 'Нет данных',
                event.organizer || 'Нет данных',
                event.city || 'Нет данных',
                event.responsiblePerson || 'Нет данных'
            ]);

            // Стиль для данных мероприятий
            eventRow.eachCell((cell) => {
                cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
                cell.border = {
                    top: { style: 'thin' },
                    left: { style: 'thin' },
                    bottom: { style: 'thin' },
                    right: { style: 'thin' }
                };
            });
        });

        // Настройка ширины столбцов
        worksheet.columns = [
            { width: 35 }, // Название
            { width: 15 }, // Дата
            { width: 15 }, // Время
            { width: 20 }, // Место
            { width: 20 }, // Организатор
            { width: 20 }, // Город
            { width: 20 }  // Ответственный
        ];

        // Генерация и скачивание файла
        const fileName = `Студент_${student.lastName}_${student.firstName}.xlsx`;
        const buffer = await workbook.xlsx.writeBuffer();
        const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = fileName;
        link.click();
        URL.revokeObjectURL(link.href);
    },

    exportTeacherDetails: async (teacher, events) => {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Преподаватель');

        // 1. Заголовок с информацией о кафедре/ПЦК
        const departmentInfo = `Преподаватель: ${teacher.department?.name || 'Не указано'}`;
        worksheet.addRow([departmentInfo]);
        worksheet.mergeCells('A1:E1');

        // Стиль для заголовка
        const headerRow = worksheet.getRow(1);
        headerRow.eachCell((cell) => {
            cell.font = { bold: true, size: 14, color: { argb: 'FFFFFFFF' } };
            cell.alignment = { vertical: 'middle', horizontal: 'center' };
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4472C4' } };
        });

        // 2. Таблица с данными преподавателя
        const teacherHeaders = ['Фамилия', 'Имя', 'Отчество', 'ПЦК', 'Кол-во мероприятий'];
        worksheet.addRow(teacherHeaders);

        // Стиль для заголовков преподавателя
        const teacherHeaderRow = worksheet.getRow(2);
        teacherHeaderRow.eachCell((cell) => {
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4472C4' } };
            cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
            cell.alignment = { vertical: 'middle', horizontal: 'center' };
            cell.border = {
                top: { style: 'thin' },
                left: { style: 'thin' },
                bottom: { style: 'thin' },
                right: { style: 'thin' }
            };
        });

        // Данные преподавателя
        const teacherDataRow = worksheet.addRow([
            teacher.lastName || 'Нет данных',
            teacher.firstName || 'Нет данных',
            teacher.middleName || 'Нет данных',
            teacher.department?.name || 'Нет данных',
            events.length
        ]);

        // Стиль для данных преподавателя
        teacherDataRow.eachCell((cell) => {
            cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
            cell.border = {
                top: { style: 'thin' },
                left: { style: 'thin' },
                bottom: { style: 'thin' },
                right: { style: 'thin' }
            };
        });

        // 3. Таблица с мероприятиями
        worksheet.addRow([]); // Пустая строка разделитель

        // Заголовок "Мероприятия преподавателя"
        worksheet.addRow(['Мероприятия преподавателя']);
        worksheet.mergeCells('A5:G5');
        const eventsTitleRow = worksheet.getRow(5);
        eventsTitleRow.eachCell((cell) => {
            cell.font = { bold: true, size: 14, color: { argb: 'FFFFFFFF' } };
            cell.alignment = { vertical: 'middle', horizontal: 'center' };
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4472C4' } };
        });

        // Заголовки таблицы мероприятий
        const eventHeaders = ['Название', 'Дата', 'Время', 'Место', 'Организатор', 'Город', 'Ответственный'];
        worksheet.addRow(eventHeaders);

        // Стиль для заголовков мероприятий
        const eventHeaderRow = worksheet.getRow(6);
        eventHeaderRow.eachCell((cell) => {
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4472C4' } };
            cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
            cell.alignment = { vertical: 'middle', horizontal: 'center' };
            cell.border = {
                top: { style: 'thin' },
                left: { style: 'thin' },
                bottom: { style: 'thin' },
                right: { style: 'thin' }
            };
        });

        // Данные мероприятий
        events.forEach(event => {
            const eventRow = worksheet.addRow([
                event.title || 'Нет данных',
                event.date || 'Нет данных',
                event.time || 'Нет данных',
                event.place || 'Нет данных',
                event.organizer || 'Нет данных',
                event.city || 'Нет данных',
                event.responsiblePerson || 'Нет данных'
            ]);

            // Стиль для данных мероприятий
            eventRow.eachCell((cell) => {
                cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
                cell.border = {
                    top: { style: 'thin' },
                    left: { style: 'thin' },
                    bottom: { style: 'thin' },
                    right: { style: 'thin' }
                };
            });
        });

        // Настройка ширины столбцов
        worksheet.columns = [
            { width: 35 }, // Название
            { width: 15 }, // Дата
            { width: 15 }, // Время
            { width: 30 }, // Место
            { width: 20 }, // Организатор
            { width: 20 }, // Город
            { width: 20 }  // Ответственный
        ];

        // Генерация и скачивание файла
        const fileName = `Преподаватель_${teacher.lastName}_${teacher.firstName}.xlsx`;
        const buffer = await workbook.xlsx.writeBuffer();
        const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = fileName;
        link.click();
        URL.revokeObjectURL(link.href);
    },

    exportEvents: async (events, departments, directions, dateFilter, specialtyFilter, departmentFilter) => {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Мероприятия');

        // Заголовок с информацией о фильтрах
        const filterInfo = `Мероприятия`;
        worksheet.addRow([filterInfo]);
        worksheet.mergeCells('A1:H1');

        // Стиль для заголовка фильтров
        const filterRow = worksheet.getRow(1);
        filterRow.eachCell((cell) => {
            cell.font = { bold: true, size: 14, color: { argb: 'FFFFFFFF' } };
            cell.alignment = { vertical: 'middle', horizontal: 'center' };
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4472C4' } };
        });

        // Заголовки таблицы мероприятий
        const eventHeaders = ['Название', 'Дата', 'Время', 'Место', 'Организатор', 'Город', 'Ответственный', 'Участники'];
        worksheet.addRow(eventHeaders);

        // Стиль для заголовков мероприятий
        const eventHeaderRow = worksheet.getRow(2);
        eventHeaderRow.eachCell((cell) => {
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4472C4' } };
            cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
            cell.alignment = { vertical: 'middle', horizontal: 'center' };
            cell.border = {
                top: { style: 'thin' },
                left: { style: 'thin' },
                bottom: { style: 'thin' },
                right: { style: 'thin' }
            };
        });

        // Настройка ширины столбцов
        worksheet.columns = [
            { width: 35 }, // Название
            { width: 15 }, // Дата
            { width: 15 }, // Время
            { width: 30 }, // Место
            { width: 20 }, // Организатор
            { width: 20 }, // Город
            { width: 20 }, // Ответственный
            { width: 40 }  // Участники
        ];

        // Добавляем данные мероприятий
        events.forEach(event => {
            // Форматируем участников
            const participantsString = [
                ...event.students.map(student => `${student.fullName} (Студент)`),
                ...event.teachers.map(teacher => `${teacher.fullName} (Преподаватель)`)
            ].join('\n') || 'Нет данных';

            const eventRow = worksheet.addRow([
                event.title || 'Нет данных',
                event.date || 'Нет данных',
                event.time || 'Нет данных',
                event.place || 'Нет данных',
                event.organizer || 'Нет данных',
                event.city || 'Нет данных',
                event.responsiblePerson || 'Нет данных',
                participantsString
            ]);

            // Стиль для данных мероприятий
            eventRow.eachCell((cell) => {
                cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
                cell.border = {
                    top: { style: 'thin' },
                    left: { style: 'thin' },
                    bottom: { style: 'thin' },
                    right: { style: 'thin' }
                };
            });
        });

        // Генерация и скачивание файла
        const fileName = `Мероприятия_${new Date().toLocaleDateString()}.xlsx`;
        const buffer = await workbook.xlsx.writeBuffer();
        const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = fileName;
        link.click();
        URL.revokeObjectURL(link.href);
    },

};

export default ExcelExporter;
