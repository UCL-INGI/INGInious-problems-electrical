# -*- coding: utf-8 -*-
#
# This file is part of INGInious. See the LICENSE and the COPYRIGHTS files for
# more information about the licensing of this file.

import os
import web
import json
import sys

from inginious.common.tasks_problems import Problem
from inginious.frontend.task_problems import DisplayableProblem

__version__ = "0.1.dev0"

PATH_TO_PLUGIN = os.path.abspath(os.path.dirname(__file__))

sys.path.append(PATH_TO_PLUGIN+'/generator')
from generator import rand_circuit


class ElectricalPage(object):
	def GET(self):
		param = web.input()
		nbrCycle, direct, reverse = param.input_cycle, param.input_direct, param.input_reverse
		return rand_circuit(int(nbrCycle), direct, reverse)


class StaticMockPage(object):
    # TODO: Replace by shared static middleware and let webserver serve the files
    def GET(self, path):           
        if not os.path.abspath(PATH_TO_PLUGIN) in os.path.abspath(os.path.join(PATH_TO_PLUGIN, path)):
            raise web.notfound()

        try:
            with open(os.path.join(PATH_TO_PLUGIN, "static", path), 'rb') as file:
                return file.read()
        except:
            raise web.notfound()

    def POST(self, path):
        return self.GET(path)


class ElectricalProblem(Problem):
    """Display an input box and check that the content is correct"""

    def __init__(self, task, problemid, content, translations=None):
        Problem.__init__(self, task, problemid, content, translations)
        self._circuit = str(content.get("circuit", ""))
        self._input_cycle = str(content.get("input_cycle", ""))
        self._input_direct = str(content.get("input_direct", ""))
        self._input_reverse = str(content.get("input_reverse", ""))

    @classmethod
    def get_type(cls):
        return "electrical"

    def input_is_consistent(self, task_input, default_allowed_extension, default_max_size):
        return self.get_id() in task_input

    def input_type(self):
        return str

    def check_answer(self, task_input, language):
        # By default, everything pass in the docker agent.
        # If answer is specified, can be assessed in MCQ-like environnment using check_answer
        if not self._answer:
            return None, None, None, 0
        elif task_input[self.get_id()].strip() == self._answer:
            return True, None, ["correct answer"], 0
        else:
            return False, None, ["wrong answer"], 0

    @classmethod
    def parse_problem(self, problem_content):
        return Problem.parse_problem(problem_content)

    @classmethod
    def get_text_fields(cls):
        return Problem.get_text_fields()


class DisplayableElectricalProblem(ElectricalProblem, DisplayableProblem):
    """ A displayable electrical problem """

    def __init__(self, task, problemid, content, translations=None):
        ElectricalProblem.__init__(self, task, problemid, content, translations)

    @classmethod
    def get_type_name(self, gettext):
        return gettext("electrical")

    @classmethod
    def get_renderer(cls, template_helper):
        """ Get the renderer for this class problem """
        return template_helper.get_custom_renderer(os.path.join(PATH_TO_PLUGIN, "templates"), False)

    def show_input(self, template_helper, language, seed):
        """ Show ElectricalProblem """
        return str(DisplayableElectricalProblem.get_renderer(template_helper).electrical(self.get_id(), self._circuit, self._input_cycle, self._input_direct, self._input_reverse))

    @classmethod
    def show_editbox(cls, template_helper, key):
        return DisplayableElectricalProblem.get_renderer(template_helper).electrical_edit(key)

    @classmethod
    def show_editbox_templates(cls, template_helper, key):
        return ""


def init(plugin_manager, course_factory, client, plugin_config):
    # TODO: Replace by shared static middleware and let webserver serve the files
	plugin_manager.add_page('/plugins/electrical/static/(.+)', StaticMockPage)
	plugin_manager.add_page('/plugins/electrical/generator', ElectricalPage)
	plugin_manager.add_hook("javascript_header", lambda: "/plugins/electrical/static/mxgraph/mxClient.min.js")
	plugin_manager.add_hook("javascript_header", lambda: "/plugins/electrical/static/electrical.js")
	course_factory.get_task_factory().add_problem_type(DisplayableElectricalProblem)
